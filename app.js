var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');

var routes = require('./routes/index');
var settings = require('./settings');
var flash = require('connect-flash');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var app = express();
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log',{flags:'a'});
var errorLog = fs.createWriteStream('error.log',{flags:'a'});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

app.use(logger('dev'));
app.use(logger({stream:accessLog}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err,reeq,res,next){
  var meta = '[' +  new Date() + ']' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});
app.use(session({
	resave: false, //添加 resave 选项
  	saveUninitialized: true, //添加 saveUninitialized 选项
	secret : settings.cookieSecret,
	key : settings.db,
	cookie : {maxAge : 1000*60*60*24*30}
}));
app.use(multer({
  dest:'./public/images',
  rename: function(fieldname,filename){
    return filename;}
}));
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
