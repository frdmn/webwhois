var express = require('express');
var router = express.Router();
var whois = require('whois')

var jsonObject = {
  'status': 'success'
};

/**
 * Check if specific TLD is allowed via
 * configuration file
 * @param  {Object}  $config
 * @param  {String}  $tld
 * @return {Boolean}
 */
function isTldAllowed(config, tld){
  if (config.tlds.indexOf(tld) === -1) {
    return false;
  } else {
    return true;
  }
}

/**
 * Whois domain name
 * @param  {String}   domain
 * @return {Callback}
 */
function whoisDomain(domain, callback){
  whois.lookup(domain, function(err, data) {
    if (err) {
      return callback(false);
    }
    callback(data);
  })
}

/**
 * Check availability of a domain using the configured
 * servers.json optiona
 * @param  {String}   domain
 * @param  {Object}   whoisServers
 * @return {Callback}
 */
function checkAvailability(domain, whoisServers, callback){
  // Split domain
  var domainParts = domain.split('.');
  var options;

  // Create response object
  var responseObject = {};
  responseObject.status = 'success';

  // Load TLD specifc configuration from servers.json
  if (whoisServers[domainParts[1]]){
    options = whoisServers[domainParts[1]];
  } else {
    responseObject.status = 'error';
    responseObject.message = 'No specific TLD configuration found in servers.json';
    return callback(responseObject);
  }

  // Whois domain name
  whois.lookup(domain, options, function(err, data) {
    if (err) {
      responseObject.status = 'error';
      responseObject.message = 'Error calling whois()';
      return callback(responseObject);
    }

    // If configured "free" indicator is not found, return false
    if (data.indexOf(options.freeIndicator) === -1) {
      responseObject.data = false;
    } else {
      responseObject.data = true;
    }

    return callback(responseObject);
  })
}

/**
 * Route - "GET /api"
 *
 * Display a general API overview
 * @return {String} JSON response
 */
router.get('/', function(req, res, next) {
  var routes = {
    'GET /api': 'This API overview',
    'GET /api/tlds': 'List all available TLDs',
    'GET /api/lookup/single/:domain': 'Check availablity of a single domain',
    'POST /api/lookup/multi': 'Check availablity of multiple domain (TLDs)',
    'GET /api/whois/:domain': 'Whois a single domain'
  };

  jsonObject.data = routes;

  return res.send(jsonObject);
});

/**
 * Route - "GET /api/tlds"
 *
 * List all available TLDs
 * @return {String} JSON response
 */
router.get('/tlds', function(req, res, next) {
  var config = req.app.locals.configuration;

  jsonObject.data = config.tlds;

  return res.send(jsonObject);
});

/**
 * Route - "GET /api/lookup/single/:domain"
 *
 * Lookup a single domain
 * @param req
 * @param res
 * @param next
 * @return {String} JSON response
 */
router.get('/lookup/single/:domain', function(req, res, next) {
  var config = req.app.locals.configuration;
  var whoisServers = req.app.locals.servers;

  // Parse domain from request path
  var domain = req.params.domain;
  var domainParts = domain.split('.');

  // Check if valid domain format
  if (domainParts.length !== 2 || domainParts[0].length < 1 || domainParts[1].length < 1 ) {
    jsonObject.status = 'error';
    jsonObject.message = 'Invalid domain name';
    return res.send(jsonObject);
  }

  // Check if TLD is allowed
  if (!isTldAllowed(config, domainParts[1])) {
    jsonObject.status = 'error';
    jsonObject.message = 'Requested TLD is not allowed for lookups';
    return res.send(jsonObject);
  }

  // Check availability of domain
  checkAvailability(domain, whoisServers, function(data){
    if (data.status === 'error') {
      jsonObject.status = 'error';
      jsonObject.message = data.message;
      return res.send(jsonObject);
    }

    // Create object for result
    var singleResult = {};
    singleResult.success = true;

    if (data.data === true) {
      singleResult.registered = true;
    } else if (data.data === false) {
      singleResult.registered = false;
    }

    // Put sinlgeResult into jsonObject
    jsonObject.data = {};
    jsonObject.data[domain] = singleResult;

    return res.send(jsonObject);
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
  var config = req.app.locals.configuration;
  // Parse domain from request path
  var domain = req.params.domain;
  var domainParts = domain.split('.');

  // Check if valid domain format
  if (domainParts.length !== 2 || domainParts[0].length < 1 || domainParts[1].length < 1 ) {
    jsonObject.status = 'error';
    jsonObject.message = 'Invalid domain name';
    return res.send(jsonObject);
  }

  // Check if TLD is allowed
  if (!isTldAllowed(config, domainParts[1])) {
    jsonObject.status = 'error';
    jsonObject.message = 'Requested TLD is not allowed for lookups';
    return res.send(jsonObject);
  }

  // Lookup domain whois
  whoisDomain(domain, function(data){
    if (!data) {
      jsonObject.status = 'error';
      jsonObject.message = 'Requested TLD is not allowed for lookups';
      return res.send(jsonObject);
    }

    jsonObject.data = data;

    return res.send(jsonObject);
  });
});

module.exports = router;
