var whois = require('whois');
var async = require('async');

/**
 * Copy the default response object
 * and return the clone
 * @return {Object}
 */
var createResponseObject = function (){
  var template = {
    'status': 'success'
  };

  return Object.assign({}, template);
};


/**
 * Check if specific TLD is allowed via
 * configuration file
 * @param  {Object}  $config
 * @param  {String}  $tld
 * @return {Boolean}
 */
var isTldAllowed = function (config, tld){
  if (config.tlds.indexOf(tld) === -1) {
    return false;
  } else {
    return true;
  }
};

/**
 * Whois domain name
 * @param  {String}   domain
 * @return {Callback}
 */
var whoisDomain = function (domain, callback){
  var options = {
    "server": 'whois.autodns3.de'
  };

  whois.lookup('full ' + domain, options, function(err, data) {
    if (err) {
      return callback(false);
    }
    callback(data.split(/\r?\n/));
  })
};

/**
 * Check availability of multiple domains using the
 * custom AutoDNS WhoisProxy
 * @param  {String}   domain
 * @return {Callback}
 */
var checkAvailabilityMulti = function (domains, cb){
  var responseObject = createResponseObject(),
      domainString = '';

  var options = {
    "server": 'whois.autodns3.de'
  };

  // Loop over available domains and append in domainString
  for (var index = 0; index < domains.length; ++index) {
    domainString += domains[index] + ',';
  }

  // Turn data element into Object
  responseObject.data = {};

  // Send whois request
  whois.lookup('multi ' + domainString, options, function(error, whoisResponse) {
    if (error) {
      responseObject.status = 'error';
      responseObject.message = err;
      return cb(responseObject);
    }

    // For each domain, add whois result
    for (var index = 0; index < domains.length; ++index) {
      // The pattern that indicates that the domain is not available to register
      needle = domains[index] + ': assigned';

      if (whoisResponse.indexOf(needle) === -1) {
        responseObject.data[domains[index]] = true;
      } else {
        responseObject.data[domains[index]] = false;
      }
    }

    // Return response
    return cb(responseObject);
  })
};

/**
 * Check availability of a single domain
 * @param  {String}   domain
 * @return {Callback}
 */
var checkAvailability = function (domain, callback){
  // Split domain
  var domainParts = domain.split('.');

  // Create new response object from template
  var responseObject = createResponseObject();

  var options = {
    "server": 'whois.autodns3.de'
  };

  // Whois domain name
  whois.lookup(domain, options, function(error, whoisResponse) {
    if (error) {
      responseObject.status = 'error';
      responseObject.message = 'Error calling whois()';
      return callback(responseObject);
    }

    // If configured "free" indicator is not found, return false
    if (whoisResponse.indexOf(options.freeIndicator) === -1) {
      responseObject.data = false;
    } else {
      responseObject.data = true;
    }

    return callback(responseObject);
  })
};

module.exports = {
  createResponseObject: createResponseObject,
  isTldAllowed: isTldAllowed,
  whoisDomain: whoisDomain,
  checkAvailabilityMulti: checkAvailabilityMulti,
  checkAvailability: checkAvailability
};
