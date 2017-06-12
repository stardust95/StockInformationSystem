var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var randomstring = require('randomstring')
var cors = require('cors');
var session = require('express-session')
var redisStore = require('connect-redis')(session)
var redis = require('./models/Redisdb');

var index = require('./routes/index');
var users = require('./routes/users');
var stocks = require('./routes/stocks');
var list = require('./routes/templatelist');
var indexs = require('./routes/indexdetails');
var indexlist = require('./routes/indexlist');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors())
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    store: new redisStore({
        client: redis.client
    }),
    secret: randomstring.generate({
        length: 128,
        charset: 'alphabetic'
    }),
    cookie: {
        domain: "112.74.124.145:3002/",
        maxAge: 60000*1000
    },
    resave: true,
    saveUninitialized: true
}));

app.use(redis.middleware);

app.use('/', index);
app.use('/users', users);
app.use('/stocks', stocks);
app.use('/indexs', indexs);
app.use('/list', list);
app.use('/indexlist', indexlist);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    // res.status(err.status || 500);
    console.log('error ' + err.status + " " + err.message)
    res.render('error', { status: err.status || 500, message: err.message});
});

module.exports = app;
