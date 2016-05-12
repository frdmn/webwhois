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
    "verbose": true,
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
 * Check availability of a domain using the configured
 * servers.json optiona
 * @param  {String}   domain
 * @param  {Object}   whoisServers
 * @return {Callback}
 */
var checkAvailability = function (domain, whoisServers, callback){
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
};

module.exports = {
  createResponseObject: createResponseObject,
  isTldAllowed: isTldAllowed,
  whoisDomain: whoisDomain,
  checkAvailability: checkAvailability
};
