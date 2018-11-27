var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  var query = req.query;
  if (query.user == 'kang' && query.password == '123456') {
    res.render('index', { title: '后台管理系统' });
  }
  else {
    res.render('login', { error: '用户名或密码错误' });
  }
});

//用户进入登录页面
router.get('/login.html', function (req, res, next) {
  res.render('login', { error: '' });
});


// router.get('/regesit.html', function (req, res, next) {
//   res.render('regesit', { error: "" });
// });
// router.get('/users', function (req, res) {
//   res.render('users', { title: '后台管理-用户管理' })
// });
router.get('/pinpai', function (req, res) {
  res.render('index', { title: '后台管理-品牌管理' })
});
router.get('/phone', function (req, res) {
  res.render('index', { title: '后台管理-手机管理' })
});
module.exports = router;
