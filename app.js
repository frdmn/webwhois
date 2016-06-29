// Modules
var express = require('express')
    , path = require('path')
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , fs = require('fs')
    , hbs = require('hbs')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , responseTime = require('response-time')
    , recaptcha = require('express-recaptcha');

// Add HJSON support
require("hjson/lib/require-config");

// Configuration files
var configuration = require('./config/config.hjson')

// Set options and initalize recaptcha
recaptcha.init(configuration.general.recaptchaSite, configuration.general.recaptchaSecret, {
  size: 'normal',
  callback: 'enableInputs'
});

// Routes
var routeIndex = require('./routes/index');
var routeApi = require('./routes/api');

// Create express app
var app = express();

// "join" Handlebars helper
hbs.registerHelper("join", function(context, block) {
  return context.join(block.hash.delimiter);
});

// "searchAndJoinTLDsForSelection" Handlebars helper
hbs.registerHelper("searchAndJoinTLDsForSelection", function(config, selection) {
  // Try to find the "selection" in the packages
  if (config.tldpackages[selection]) {
    return config.tldpackages[selection].tlds.join(', ');
  }

  // Otherwise assume a single TLD is meant
  if (config.tlds.indexOf(selection) === -1) {
    return false;
  } else {
    var index = config.tlds.indexOf(selection);
    return config.tlds[index];
  }

  return false;
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(responseTime());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

configuration.version = fs.readFileSync('./VERSION', 'utf8');
app.locals.configuration = configuration;

app.use('/', routeIndex);
app.use('/api', routeApi);

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
