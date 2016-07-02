// Modules
var express = require('express')
    , path = require('path')
    , favicon = require('serve-favicon')
    , fs = require('fs')
    , hbs = require('hbs')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , responseTime = require('response-time')
    , recaptcha = require('express-recaptcha')
    , FileStreamRotator = require('file-stream-rotator')
    , morgan = require('morgan');

// Add HJSON support
require("hjson/lib/require-config");

// Configuration files
var configuration = require('./config.hjson')

// Set options and initalize recaptcha
recaptcha.init(configuration.general.recaptchaSite, configuration.general.recaptchaSecret, {
  size: 'normal'
  , callback: 'enableInputs'
});

// Setup logger
var logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD'
  , filename: path.join(logDirectory, '%DATE%_access.log')
  , frequency: 'daily'
  , verbose: false
});

// Routes
var routeIndex = require('./lib/routes/index')
    , routeApi = require('./lib/routes/api');

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

// "ifCond" Handlebars helper
hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'))
   .set('view engine', 'hbs');

// Configure middlewares
app.use(responseTime())
   .use(morgan('combined', {stream: accessLogStream}))
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }))
   .use(cookieParser())
   .use(express.static(path.join(__dirname, 'public')));

configuration.version = fs.readFileSync('./VERSION', 'utf8');
app.locals.configuration = configuration;

app.use('/', routeIndex)
   .use('/api', routeApi);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler
// Will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Production error handler
// No stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
