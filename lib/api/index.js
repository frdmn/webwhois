var whois = require('whois');

module.exports = {
  /**
   * Copy the default response object
   * and return the clone
   * @return {Object}
   */
  createResponseObject: function (){
    var template = {
      'status': 'success'
    };

    return Object.assign({}, template);
  },

  /**
   * Check if specific TLD is allowed via
   * configuration file
   * @param  {Object}  $config
   * @param  {String}  $tld
   * @return {Boolean}
   */
  isTldAllowed: function (config, tld){
    if (config.tlds.indexOf(tld) === -1) {
      return false;
    } else {
      return true;
    }
  },

  /**
   * Whois domain name
   * @param  {String}   domain
   * @return {Callback}
   */
  whoisDomain: function (domain, callback){
    whois.lookup(domain, {"verbose": true}, function(err, data) {
      if (err) {
        return callback(false);
      }
      callback(data);
    })
  }
};
