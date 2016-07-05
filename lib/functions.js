// Require modules
var whois = require('whois')
    async = require('async');

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
 * Function to evaluate node-whois error
 * responses
 * @param  {Object} error
 * @param  {Object} data
 * @return {String|Bool}
 */
var evaluteWhoisResponse = function(error, data){
  if (error) {
    // Check if ECONNRESET, which is sent by AutoDNS' custom whois when IP is not whitelisted
    if (error.code === 'ECONNRESET') {
      return 'Can\'t establish connection to AutoDNS whois server. IP not whitelisted?';
    } else {
      // Otherwise use error reported by node-whois
      return error.message;
    }
  }

  // Check if API usage limit is not exceeded
  if(data.indexOf('The monthly overall-limit of requested domains') > -1) {
    return 'The monthly overall-limit of requested domains has been reached. Please contact support for further information.';
  }

  // Return true
  return true;
}

/**
 * Whois domain name
 * @param  {String}   domain
 * @return {Callback}
 */
var whoisDomain = function (domain, callback){
  var responseObject = createResponseObject();

  var options = {
    "server": 'whois.autodns3.de'
    , "punycode": false
  };

  whois.lookup('full ' + domain, options, function(error, data) {
    var evaluateError = evaluteWhoisResponse(error, data);
    if (evaluateError !== true) {
      responseObject.status = 'error';
      responseObject.message = evaluateError;
      return callback(responseObject);
    }

    responseObject.data = data.split(/\r?\n/);

    return callback(responseObject);
  })
};

/**
 * Check availability of multiple domains using the
 * custom AutoDNS WhoisProxy
 * @param  {String}   domain
 * @return {Callback}
 */
var checkAvailability = function (domains, cb){
  var responseObject = createResponseObject()
      , domainString = '';

  var options = {
    "server": 'whois.autodns3.de'
    , "punycode": false
  };

  // Loop over available domains and append in domainString
  for (var index = 0; index < domains.length; ++index) {
    domainString += domains[index] + ',';
  }

  // Turn data element into Object
  responseObject.data = {};

  // Send whois request
  whois.lookup('multi ' + domainString, options, function(error, data) {
    // Check for general whois errors
    var evaluateError = evaluteWhoisResponse(error, data);
    if (evaluateError !== true) {
      responseObject.status = 'error';
      responseObject.message = evaluateError;
      return cb(responseObject);
    }

    // Split respons per new line, since AutoDNS returns a dedicated line
    // for each requested domain
    var whoisResponseLines = data.split(/\r?\n/);

    // For each domain, try to evaluate result
    for (var index = 0; index < domains.length; ++index) {

      // Create full domain name based on domain + tld, search for index in
      // whois result and create a sub response object
      var fullDomain = domains[index]
          , arrayIndex = searchStringInArray(fullDomain + ':', whoisResponseLines)
          , domainResponseObject = createResponseObject();

      // Check if line is found that contains requested domain
      if (arrayIndex !== -1) {
        // The pattern that indicates that the domain is available, assigned or invalid
        var needleAvailable = fullDomain + ': free';
        var needleAssigned = fullDomain + ': assigned';
        var needleInvalid = fullDomain + ': invalid';

        // Evaluate the response line for the specific domain
        if (whoisResponseLines[arrayIndex].indexOf(needleAvailable) !== -1) {
          domainResponseObject.available = true;
        } else if (whoisResponseLines[arrayIndex].indexOf(needleAssigned) !== -1) {
          domainResponseObject.available = false;
        } else {
          domainResponseObject.status = 'error';
          domainResponseObject.message = whoisResponseLines[arrayIndex].replace(fullDomain + ': ', '');
        }
      } else {
        domainResponseObject.status = 'error';
        domainResponseObject.message = 'Couldn\'t find domain in whois response';
      }

      // Push domain objkect into response object
      responseObject.data[fullDomain] = domainResponseObject;
    }

    // Return response
    return cb(responseObject);
  })
};

module.exports = {
  searchStringInArray: searchStringInArray
  , createResponseObject: createResponseObject
  , isTldAllowed: isTldAllowed
  , whoisDomain: whoisDomain
  , checkAvailability: checkAvailability
};
