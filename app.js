// Rquire modules
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
    , i18n = require("i18n-express")
    , morgan = require('morgan')
    , debug = require('debug')('webwhois:app');

// Add HJSON support
require("hjson/lib/require-config");

// Try to load configuration file
try {
  var configuration = require('./config.hjson')
  debug('Successfully loaded HJSON file ./config.hjson');
} catch(e) {
  // Exit in case there is none
  console.error('Couldn\'t find configuration file "config.hjson"!');
  process.exit(1);
}

// Set options and initalize recaptcha
recaptcha.init(configuration.general.recaptchaSite, configuration.general.recaptchaSecret, {
  size: 'normal'
  , callback: 'enableInputs'
});

// Setup log directories
var logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
  debug('No logs/ directory found. Recreating...');
}

// And access log file rotation
var accessLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD'
  , filename: path.join(logDirectory, '%DATE%_access.log')
  , frequency: 'daily'
  , verbose: false
});

// Express router
var routeIndex = require('./lib/routes/index')
    , routeApi = require('./lib/routes/api');

// Create express app
var app = express()
   .set('views', path.join(__dirname, 'views'))
   .set('view engine', 'hbs');

// Configure middlewares
app.use(responseTime())
   .use(morgan('combined', {stream: accessLogStream}))
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }))
   .use(cookieParser())
   .use(i18n({
      translationsPath: path.join(__dirname, 'i18n'),
      siteLangs: ['en','de'],
      paramLangName: 'lang'
   }))
   .use(express.static(path.join(__dirname, 'public')));

// Inject current version string into config object
configuration.version = fs.readFileSync(path.join(__dirname, 'VERSION'), 'utf8');
app.locals.configuration = configuration;

// Mount router for frontend and API
app.use('/', routeIndex)
   .use('/api', routeApi);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Development error handler (print stacktraces)
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      config: app.locals.configuration
    });
  });
}

// Production error handler (without printing stacktraces)
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    config: app.locals.configuration
  });
});

/**
 * Handlebars helper - "join"
 * @usage
 *   {{join arrayObject delimiter=", "}}
 */
hbs.registerHelper("join", function(context, block) {
  return context.join(block.hash.delimiter);
});

/**
 * Handlebars helper - "ifCond"
 * @usage
 *   {{#ifCond thisObject equalsThat}}
 *     show this
 *   {{else}}
 *     show that
 *   {{/ifCond}}
 */
hbs.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

module.exports = app;
