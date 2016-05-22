var whois = require('whois');
var async = require('async');

/**
 * Iterate over string array and serach for substring
 * @param  {String} string
 * @param  {Array} String array
 * @return {String|Boolean}
 */
var searchStringInArray = function (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
};

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
var checkAvailability = function (domains, cb){
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
      var domainResponseObject = createResponseObject();

      // The pattern that indicates that the domain is not available to register
      var needleAvailable = domains[index] + ': free';
      var needleAssigned = domains[index] + ': assigned';
      var needleInvalid = domains[index] + ': invalid';

      if (whoisResponse.indexOf(needleAvailable) !== -1) {
        domainResponseObject.available = true;
      } else if (whoisResponse.indexOf(needleAssigned) !== -1) {
        domainResponseObject.available = false;
      } else if (whoisResponse.indexOf(needleInvalid) !== -1) {
        domainResponseObject.available = false;
      } else {
        domainResponseObject.status = 'error';
        domainResponseObject.message = 'Unexpected whois response';
      }

      responseObject.data[domains[index]] = domainResponseObject;
    }

    // Return response
    return cb(responseObject);
  })
};

module.exports = {
  searchStringInArray: searchStringInArray,
  createResponseObject: createResponseObject,
  isTldAllowed: isTldAllowed,
  whoisDomain: whoisDomain,
  checkAvailability: checkAvailability
};
