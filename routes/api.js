var express = require('express'),
    async = require('async'),
    whois = require('whois');

var functions = require('../lib/functions');

var router = express.Router();

/**
 * Route - "GET /api"
 *
 * Display a general API overview
 * @return {String} JSON response
 */
router.get('/', function(req, res, next) {
  // Create new response object from template
  var responseObject = functions.createResponseObject();

  var routes = {
    'GET /api': 'This API overview',
    'GET /api/tlds': 'List all available TLDs',
    'GET /api/lookup/domain/:domain': 'Check availablity of a single domain',
    'POST /api/lookup/package': 'Check availablity of for several domains (using a TLD package)',
    'GET /api/whois/:domain': 'Whois a single domain'
  };

  responseObject.data = routes;

  return res.send(responseObject);
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

  // Store configuration file from app locals
  var config = req.app.locals.configuration;

  responseObject.data = config.tlds;

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
router.get('/lookup/domain/:domain', function(req, res, next) {
  // Create new response object from template
  var responseObject = functions.createResponseObject();

  // Store configuration file from app locals
  var config = req.app.locals.configuration;

  // Parse domain from request path
  var domain = req.params.domain,
      domainParts = domain.split('.');

  // Check if valid domain format
  if (domainParts.length !== 2 || domainParts[0].length < 1 || domainParts[1].length < 1 ) {
    responseObject.status = 'error';
    responseObject.message = 'Invalid domain name';
    return res.send(responseObject);
  }

  // Check if TLD is allowed
  if (!functions.isTldAllowed(config, domainParts[1])) {
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
router.post('/lookup/package', function(req, res, next) {
  var responseObject = functions.createResponseObject();

  // Store configuration file from app locals
  var config = req.app.locals.configuration,
      domains = [];

  // Retrieve POST body parameter
  var domain = req.body.domain,
      package = req.body.package;

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
  if (config.tldpackages[package] && config.tldpackages[package].tlds) {
    var tldArray = config.tldpackages[package].tlds;
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
router.get('/whois/:domain', function(req, res, next) {
  // Create new response object from template
  var responseObject = functions.createResponseObject();

  // Store configuration file from app locals
  var config = req.app.locals.configuration;

  // Parse domain from request path
  var domain = req.params.domain,
      domainParts = domain.split('.');

  // Check if valid domain format
  if (domainParts.length !== 2 || domainParts[0].length < 1 || domainParts[1].length < 1 ) {
    responseObject.status = 'error';
    responseObject.message = 'Invalid domain name';
    return res.send(responseObject);
  }

  // Check if TLD is allowed
  if (!functions.isTldAllowed(config, domainParts[1])) {
    responseObject.status = 'error';
    responseObject.message = 'Requested TLD is not allowed for lookups';
    return res.send(responseObject);
  }

  // Check if AutoDNS proxy feature is enabled
  functions.whoisDomain(domain, function(data){
    if (!data) {
      responseObject.status = 'error';
      responseObject.message = 'Requested TLD is not allowed for lookups';
      return res.send(responseObject);
    }

    responseObject.data = data;

    return res.send(responseObject);
  });
});

module.exports = router;
