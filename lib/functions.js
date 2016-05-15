var whois = require('whois');

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

  whois.lookup(domain, options, function(err, data) {
    if (err) {
      return callback(false);
    }
    callback(data.split('\r\n'));
  })
};

/**
 * Check availability of multiple domains using the
 * custom AutoDNS WhoisProxy
 * @param  {String}   domain
 * @return {Callback}
 */
var checkAvailabilityMulti = function (domains, callback){
  return callback(domains);
};

/**
 * Check availability of a domain using the configured
 * servers.json optiona
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
};

module.exports = {
  createResponseObject: createResponseObject,
  isTldAllowed: isTldAllowed,
  whoisDomain: whoisDomain,
  checkAvailabilityMulti: checkAvailabilityMulti,
  checkAvailability: checkAvailability
};
