var express = require('express'),
    async = require('async'),
    whois = require('whois');

var router = express.Router();

/**
 * Copy the default response object
 * and return the clone
 * @return {Object}
 */
function createResponseObject(){
  var template = {
    'status': 'success'
  };

  return Object.assign({}, template);
}

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
  var domainParts = domain.split('.'),
      options;

  // Create response object
  // Create new response object from template
  var responseObject = createResponseObject();

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
  // Create new response object from template
  var responseObject = createResponseObject();

  var routes = {
    'GET /api': 'This API overview',
    'GET /api/tlds': 'List all available TLDs',
    'GET /api/lookup/single/:domain': 'Check availablity of a single domain',
    'POST /api/lookup/multi': 'Check availablity of multiple domain (TLDs)',
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
  var responseObject = createResponseObject();

  // Store configuration file from app locals
  var config = req.app.locals.configuration;

  responseObject.data = config.tlds;

  return res.send(responseObject);
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
  // Create new response object from template
  var responseObject = createResponseObject();

  // Store configuration file from app locals
  var config = req.app.locals.configuration,
      whoisServers = req.app.locals.servers;

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
  if (!isTldAllowed(config, domainParts[1])) {
    responseObject.status = 'error';
    responseObject.message = 'Requested TLD is not allowed for lookups';
    return res.send(responseObject);
  }

  // Check availability of domain
  checkAvailability(domain, whoisServers, function(data){
    if (data.status === 'error') {
      responseObject.status = 'error';
      responseObject.message = data.message;
      return res.send(responseObject);
    }

    // Create response object for each domain
    var tldResponseObject = createResponseObject();

    if (data.data === true) {
      tldResponseObject.registered = false;
    } else if (data.data === false) {
      tldResponseObject.registered = true;
    }

    // Put tldResponseObject into responseObject
    responseObject.data = {};
    responseObject.data[domain] = tldResponseObject;

    return res.send(responseObject);
  });
});

/**
 * Route - "POST /api/lookup/multi"
 *
 * Whois multiple domain TLDs
 * @param req
 * @param res
 * @param next
 * @return {String} JSON response
 */
router.post('/lookup/multi', function(req, res, next) {
  var responseObject = createResponseObject();

  // Store configuration file and server configuration from app locals
  var config = req.app.locals.configuration,
      whoisServers = req.app.locals.servers,
      results = {};

  // Retrieve POST body parameter
  var domain = req.body.domain,
      tlds = req.body.tlds;

  // Check for "domain"
  if (!domain || domain.length === 0) {
    responseObject.status = 'error';
    responseObject.message = 'Couldn\'t find "domain" parameter';
    return res.send(responseObject);
  }

  // and for "tlds"
  if (!tlds || tlds.length === 0) {
    responseObject.status = 'error';
    responseObject.message = 'Couldn\'t find "tlds" parameter';
    return res.send(responseObject);
  }

  // Remove whitespaces und split by ','
  var tldArray = tlds.replace(/\s/g, '').split(',');

  // Start parallel lookup task for each available TLD
  async.each(tldArray, function (tld, callback) {
    var tldResponseObject = createResponseObject(),
        fullDomain = domain + '.' + tld;

    // Check if TLD is allowed
    if (!isTldAllowed(config, tld)) {
      tldResponseObject.status = 'error';
      tldResponseObject.message = 'Requested TLD is not allowed for lookups';
      results[fullDomain] = tldResponseObject;
      callback();
      return;
    }

    // Check availability of domain
    checkAvailability(fullDomain, whoisServers, function(data){
      if (data.status === 'error') {
        tldResponseObject.status = 'error';
        tldResponseObject.message = data.message;
        results[fullDomain] = tldResponseObject;
        callback();
        return;
      }

      if (data.data === true) {
        tldResponseObject.registered = true;
      } else if (data.data === false) {
        tldResponseObject.registered = false;
      };

      results[fullDomain] = tldResponseObject;
      callback();
    });
  }, function (err) {
    responseObject.data = results;
    return res.send(responseObject);
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
  var responseObject = createResponseObject();

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
  if (!isTldAllowed(config, domainParts[1])) {
    responseObject.status = 'error';
    responseObject.message = 'Requested TLD is not allowed for lookups';
    return res.send(responseObject);
  }

  // Lookup domain whois
  whoisDomain(domain, function(data){
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
