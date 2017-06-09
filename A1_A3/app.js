var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var ejs = require('ejs');

var index = require('./routes/index');
var login = require('./routes/login');
var users = require('./routes/users');
var edit = require('./routes/edit');
var regist = require('./routes/regist');
var main = require('./routes/main');
var logout = require('./routes/logout');
var editmainpage = require('./routes/editmainpage');
var mainManage = require('./routes/mainManage');
var mainpage = require('./routes/mainpage');
var password = require('./routes/password');
var orders = require('./routes/orders');
var userstock = require('./routes/userstock');
var traderecord = require('./routes/traderecord');
var discard = require('./routes/discard');
var tradeManage_stock = require('./routes/tradeManage_stock');
var tradeManage_user = require('./routes/tradeManage_user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.ejs',ejs.__express);
app.set('view engine', 'ejs');
// app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 设置 Session
app.use(session({
     secret: '12345',
     name: 'demo',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
     cookie: {maxAge: 1800000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
     resave: false,
     saveUninitialized: true,
 }));

app.use('/', index);
app.use('/login',login);
app.use('/users', users);
app.use('/logout', logout);
app.use('/edit', edit);
app.use('/regist', regist);
app.use('/main', main);
app.use('/editmainpage', editmainpage);
app.use('/mainManage', mainManage);
app.use('/mainpage', mainpage);
app.use('/traderecord', traderecord);
app.use('/password', password);
app.use('/orders', orders);
app.use('/userstock', userstock);
app.use('/discard', discard);
app.use('/tradeManage_stock', tradeManage_stock);
app.use('/tradeManage_user', tradeManage_user);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
