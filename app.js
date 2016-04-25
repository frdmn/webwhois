var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fs = require('fs');
var hbs = require('hbs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var configuration = require('./config.json')

var routeIndex = require('./routes/index');
var routeApi = require('./routes/api');

var app = express();

// "join" Handlebars helper
hbs.registerHelper("join", function(context, block) {
  return context.join(block.hash.delimiter);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

configuration.version = fs.readFileSync('./VERSION', 'utf8');
app.locals.configuration = configuration;

app.use('/', routeIndex);
app.use('/users', routeApi);

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
