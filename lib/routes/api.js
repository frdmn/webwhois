// Require modules
var express = require('express')
    , path = require('path')
    , async = require('async')
    , whois = require('whois')
    , functions = require('../functions')
    , router = express.Router()
    , recaptcha = require('express-recaptcha')
    , configuration = require('../../config.hjson')
    , create_logger = require('fsr-logger').create_logger;

// Setup logger
var logDirectory = path.join(__dirname, '..', '..', 'logs');
log = create_logger({
  date_format: 'YYYYMMDD'
  , filename: path.join(logDirectory, '%DATE%_api.log')
  , frequency: 'daily'
  , verbose: false
});

/**
 * Route - "GET /api/tlds"
 *
 * List all available TLDs
 * @return {String} JSON response
 */
router.get('/tlds', function(req, res, next) {
  // Create new response object from template
  var responseObject = functions.createResponseObject();

  // Add TLDs from configuration
  responseObject.data = configuration.tlds;

  return res.send(responseObject);
});

/**
 * Route - "GET /api/lookup/domain/:domain"
 *
 * Lookup a single domain name
 * @param req
 * @param res
 * @param next
 * @return {String} JSON response
 */
router.post('/lookup/domain', recaptcha.middleware.verify, function(req, res, next) {
  // Create new response object from template
  var responseObject = functions.createResponseObject();

  // Parse domain from request path
  var domain = req.body.domain
      , domainParts = domain.split('.')
      , clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // If captcha is enabled, check for validation
  if (configuration.general.enableCaptcha) {
    if (req.recaptcha.error !== null) {
      responseObject.status = 'error';
      responseObject.message = 'Invalid captcha (' + req.recaptcha.error + ')';
      return res.send(responseObject);
    }
  }

  // Check if valid domain format
  if (domainParts.length !== 2 || domainParts[0].length < 1 || domainParts[1].length < 1 ) {
    responseObject.status = 'error';
    responseObject.message = 'Invalid domain name';
    return res.send(responseObject);
  }

  // Check if TLD is allowed
  if (!functions.isTldAllowed(configuration, domainParts[1])) {
    responseObject.status = 'error';
    responseObject.message = 'Requested TLD is not allowed for lookups';
    return res.send(responseObject);
  }

  var domains = [
    domain
  ];

  // Check availability of domain
  functions.checkAvailability(domains, function(data){
    if (data.status === 'error') {
      responseObject.status = 'error';
      responseObject.message = data.message;
      return res.send(responseObject);
    }

    // Log domain lookup request
    log(clientIp + ' ' + domain + ' (single)');

    // Create response object for each domain
    var tldResponseObject = functions.createResponseObject();

    if (data.data === true) {
      tldResponseObject.registered = false;
    } else if (data.data === false) {
      tldResponseObject.registered = true;
    }

    // Put tldResponseObject into responseObject
    responseObject.data = {};
    responseObject.data[domain] = tldResponseObject;

    return res.send(data);
  });
});

/**
 * Route - "POST /api/lookup/package"
 *
 * Whois multiple domain TLDs using a package
 * @param req
 * @param res
 * @param next
 * @return {String} JSON response
 */
router.post('/lookup/package', recaptcha.middleware.verify,  function(req, res, next) {
  var responseObject = functions.createResponseObject();

  // Store configuration file from app locals
  var domains = [];

  // Retrieve POST body parameter
  var domain = req.body.domain
      , package = req.body.package
      , clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // If captcha is enabled, check for validation
  if (configuration.general.enableCaptcha) {
    if (req.recaptcha.error !== null) {
      responseObject.status = 'error';
      responseObject.message = 'Invalid captcha (' + req.recaptcha.error + ')';
      return res.send(responseObject);
    }
  }

  // Check for "domain"
  if (!domain || domain.length === 0) {
    responseObject.status = 'error';
    responseObject.message = 'Couldn\'t find "domain" parameter';
    return res.send(responseObject);
  }

  // and for "tlds"
  if (!package || package.length === 0) {
    responseObject.status = 'error';
    responseObject.message = 'Couldn\'t find "package" parameter';
    return res.send(responseObject);
  }

  // Check if "package" is really indeed a package and not only a single TLD
  if (configuration.tldpackages[package] && configuration.tldpackages[package].tlds) {
    var tldArray = configuration.tldpackages[package].tlds;
  } else {
    // ... only a single TLD, use that one instead
    var tldArray = [package];
  }

  // Check for existence
  if (!tldArray || package.length === 0) {
    responseObject.status = 'error';
    responseObject.message = 'Couldn\'t find package "' + package + '"';
    return res.send(responseObject);
  }

  // Loop over available TLDs and create full domains
  for (var index = 0; index < tldArray.length; ++index) {
    domains.push(domain + '.' + tldArray[index]);
  }

  // Check availability of domain
  functions.checkAvailability(domains, function(data){
    if (data.status === 'error') {
      responseObject.status = 'error';
      responseObject.message = data.message;
      return res.send(responseObject);
    }

    // Log each domain lookup request
    for (var index = 0; index < tldArray.length; ++index) {
      log(clientIp + ' ' + domain + '.' + tldArray[index] + ' (multi)');
    }

    // Create response object for each domain
    var tldResponseObject = functions.createResponseObject();

    if (data.data === true) {
      tldResponseObject.registered = false;
    } else if (data.data === false) {
      tldResponseObject.registered = true;
    }

    // Put tldResponseObject into responseObject
    responseObject.data = {};
    responseObject.data[domain] = tldResponseObject;

    return res.send(data);
  });
});

/**
 * Route - "GET /api/whois/:domain"
 *
 * Lookup raw whois
 * @param req
 * @param res
 * @param next
 * @return {String} JSON response
 */
router.post('/whois', recaptcha.middleware.verify, function(req, res, next) {
  // Create new response object from template
  var responseObject = functions.createResponseObject();

  // Parse domain from request path
  var domain = req.body.domain
      , domainParts = domain.split('.')
      , clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Abbort if raw whois is not enabled
  if (!configuration.general.enableWhoisRoute) {
    responseObject.status = 'error';
    responseObject.message = 'Raw whois route not enabled in configuration.';
    return res.send(responseObject);
  }

  // If captcha is enabled, check for validation
  if (configuration.general.enableCaptcha) {
    if (req.recaptcha.error !== null) {
      responseObject.status = 'error';
      responseObject.message = 'Invalid captcha (' + req.recaptcha.error + ')';
      return res.send(responseObject);
    }
  }

  // Check if valid domain format
  if (domainParts.length !== 2 || domainParts[0].length < 1 || domainParts[1].length < 1 ) {
    responseObject.status = 'error';
    responseObject.message = 'Invalid domain name';
    return res.send(responseObject);
  }

  // Check if TLD is allowed
  if (!functions.isTldAllowed(configuration, domainParts[1])) {
    responseObject.status = 'error';
    responseObject.message = 'Requested TLD is not allowed for lookups';
    return res.send(responseObject);
  }

  // Check if AutoDNS proxy feature is enabled
  functions.whoisDomain(domain, function(data){
    if (data.status === 'error') {
      responseObject.status = 'error';
      responseObject.message = data.message;
      return res.send(responseObject);
    }

    // Log each domain lookup request
    log(clientIp + ' ' + domain + ' (whois)');

    responseObject.data = data.data;

    return res.send(responseObject);
  });
});

/**
 * Fallback / catch-all route - "GET /api/*"
 *
 * Display a general API directory/overview
 * @return {String} JSON response
 */
router.all('*', function(req, res, next) {
  // Create new response object from template
  var responseObject = functions.createResponseObject();

  var routes = {
    'GET /api/*': 'This API overview'
    , 'GET /api/tlds': 'List all available TLDs'
    , 'POST /api/lookup/domain': 'Check availablity of a single domain'
    , 'POST /api/lookup/package': 'Check availablity of for several domains (using a TLD package)'
  };

  // If raw whois is enabled, add that to route directory
  if (configuration.general.enableWhoisRoute) {
    routes['POST /api/whois'] = 'Whois a single domain';
  }

  responseObject.data = routes;

  return res.send(responseObject);
});

module.exports = router;
