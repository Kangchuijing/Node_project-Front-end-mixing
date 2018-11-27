var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = 'mongodb://127.0.0.1:27017';
/* GET users listing. */

// 用户信息页面
// localhost:3000/users/
router.get('/', function (req, res, next) {
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
    db.collection('users').find().toArray(function (error, data) {
      if (error) {
        console.log('数据查询失败');
        res.redirect('error', {
          message: '数据库连接失败',
          error: error
        });
        return;
      }
      console.log('数据查询成功');
      //如果查到了数据，就去渲染users这个页面
      res.render('users', { title: '后台管理-用户管理', data: data });
      //关闭数据库的连接
      client.close();
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
        res.redirect('/users');
      }
    });
    client.close();
  })
});

// 用户注册页面
// localhost:3000/users/regesit
router.get('/regesit', function (req, res, next) {
  res.render('regesit', { error: "" });
});
module.exports = router;
