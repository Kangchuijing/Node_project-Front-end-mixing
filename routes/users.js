var express = require('express');
var router = express.Router();
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = 'mongodb://127.0.0.1:27017';
/* GET users listing. */

// 用户信息页面
// localhost:3000/users/
router.get('/', function (req, res, next) {
  //分页操作
  var page = parseInt(req.query.page) || 1;
  var pageSize = parseInt(pageSize) || 4;
  var totalSize = 0;
  MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
    if (error) {
      console.log("数据库连接失败");
      res.render('error', {
        message: '数据库连接失败',
        error: error
      });
      return;
    }
    //选择我们要连接的数据库
    var db = client.db('project');
    //对collection进行操作
    // 使用异步流程控制对数据进行分页操作
    // 1、查询数据的总条数
    async.series([
      function (cb) {
        db.collection('users').find().count(function (error, data) {
          if (error) {
            console.log('用户信息条数查询失败');
            cb(error);
          } else {
            totalSize = data;
            cb(null);
          }
        })
      },
      function (cb) {
        // 2、查询每页的数据 
        db.collection('users').find().limit(pageSize).skip(pageSize * (page - 1)).toArray(function (error, data) {
          if (error) {
            console.log('数据查询失败');
            cb(error);
          }
          else {
            console.log('数据查询成功');
            cb(null, data);
          }
        });
      }
    ],
      function (error, result) {
        if (error) {
          console.log('异步执行失败');
          res.render('error', {
            message: '数据查询出错',
            error: error
          });
        } else {

          //如果查到了数据，就去渲染users这个页面
          var totalPage = Math.ceil(totalSize / pageSize);  // 计算总的页数，向上取整
          console.log('当前页是', page, '总页数是', totalPage);
          res.render('users', {
            title: '后台管理-用户管理',
            data: result[1],
            currentPage: page,
            pageSize: pageSize,
            totalSize: totalSize,
            totalPage: totalPage
          });
          //关闭数据库的连接
          client.close();
        }
      });

  });
});
// 用户信息删除页面
// localhost:3000/users/delete
router.get('/delete', function (req, res, next) {
  //获取用户传递参数的id值
  var id = req.query.id;
  var did = ObjectId(id);
  MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
    if (error) {
      console.log('数据库连接失败');
      res.render('error', {
        message: '数据库连接失败',
        error: error
      });
    }
    else {
      //如果连接数据库成功
      var db = client.db('project');
      db.collection('users').deleteOne({
        _id: did
      }, function (error) {
        if (error) {
          console.log('数据删除失败');
          res.render('error', { message: '数据删除失败', error: '数据删除失败' });
        } else {  // 如果数据删除成功，刷新页面
          res.redirect('/users');
        }
      })
    }
  });
});

// 用户登录提交页面
// localhost: 3000 / users / login
router.post('/login', function (req, res, next) {
  console.log('我是一个登录页面');
  MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
    if (error) {
      console.log('数据库连接失败');
      res.render('error', { message: '数据库连接失败', error: error });
      return;
    }
    // 如果连接成功
    var db = client.db('project');
    // 保存用户名和密码
    var user = req.body.user;
    var password = req.body.password;
    db.collection('users').find({ name: user, password: password }).toArray(function (error, data) {
      if (error) {

        console.log('查找失败');
        res.render('error', { message: '查找失败', error: error });
        return;

      } else if (data.length <= 0) { //如果数组中没有数据

        console.log('登录失败');
        res.render('error', { message: '登录失败', error: "error" });
        return;

      } else { //登录成功
        console.log('登录成功');
        res.cookie('nickname', data[0].nickname, { maxAge: 6 * 1000 * 60 });  //设置cookie有效期为6分钟
        res.redirect('/');
      }
    });
    client.close();
  })
});

// 用户注册页面
// localhost:3000/users/regesit
router.post('/regesit', function (req, res, next) {
  // 这里可以直接获取请求体中的数据，因为已经导入了相应的中间件进行处理了
  var user = req.body.user;
  var password = req.body.password;
  var nickname = req.body.nickname;
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin;
  var power = req.body.power;
  // 这里使用异步流程控制来解决异步问题
  MongoClient.connect(url, { useNewUrlParser: true }, function (error, client) {
    if (error) {
      console.log('数据库连接失败');
      res.render('error', {
        message: '数据库连接失败',
        error: error
      });
    }
    else {
      var db = client.db('project');
      async.series([
        function (cb) {
          //首先应该到数据库中查询是否该用户名已经注册
          db.collection('users').find({
            name: user
          }).toArray(function (error, data) {
            if (error) {
              console.log('数据库查询出错');
              cb('数据库查询出错');
            } else if (data.length > 0) {
              console.log(data);
              console.log('该用户名已经注册，请换一个再来尝试');
              cb(new Error('用户名已经存在，请换一个用户名再来尝试'));

            } else {
              console.log('数据查询成功');
              cb(null);
            }
          });
        },
        function (cb) {
          db.collection('users').insertOne({
            name: user,
            nickname: nickname,
            password: password,
            sex: sex,
            isAdmin: isAdmin === '是' ? true : false,
            power: power
          }, function (error) {
            if (error) {
              cb(error);
            } else {
              console.log('数据插入成功');
              cb(null);
            }
          })
        }
      ], function (error, result) {
        if (error) {
          res.render('error', {
            message: '出现了一些小问题',
            error: error
          });
        } else {  // 如果注册成功，那么就重定向至登陆页面
          res.redirect('/login.html');
        }
      });
    }
  })
});
module.exports = router;
