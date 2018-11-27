var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ignoreRouter = require('./config/ignoreRouter'); //忽略登录校验的url

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 自己写的中间件，用来做登录校验的。判断用户是否登录
app.use(function (req, res, next) {
  if (ignoreRouter.indexOf(req.url) != -1) { // 如果说用户请求的url是在要被忽略处理的数组中那么就不执行这个中间件
    next();
    return;
  }
  var nickname = req.cookies.nickname; //获取cookie中键为nickname的信息
  if (nickname) {   //如果有这条信息，那么就说明用户已经登录了，那么就不需要再登录
    next();       // 执行下面的中间件
    return;       // 退出回调函数（这一步是必须的）
  } else {      // 如果用户没有登录，那么重定向至登录页面（无论用户输入什么url地址，访问的只能是登录页面）
    res.redirect('/login.html');
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
