$(function() {
  /**
   * Load configuration file asynchronously
   * @return {Callback}
   */
  var loadConfigFile = function(callback){
    $.getJSON('config.json', function(data) {
      callback(data);
    });
  };

  /**
   * Return all TLDs for the configured
   * 'default-selection'
   * @param  {Object} config
   * @return {String} TLD(s)
   */
  var getDefaultSelectionTlds = function(config){
    var defaultSelection = config.general['default-selection'];

    // Search in TLD packages
    for(var package in config.tldpackages){
      if (package === defaultSelection) {
        return config.tldpackages[package].tlds.join(', ');
      }
    }

    // Search in TLDs
    if (config.tlds.indexOf(defaultSelection) !== -1) {
      var index = config.tlds.indexOf(defaultSelection);
      return config.tlds[index];
    }

    return false;
  }

  // Make sure to load config file
  loadConfigFile(function(config){
    // Insert the first domain package in the hidden input
    var defaultTlds = $('#dropdownmenu > li').first().data('tlds');
    $('#tlds').val(getDefaultSelectionTlds(config));
    $('#tld-display').text(config.general['default-selection']);
  });

  // Update fake "select" when user clicks on package in dropdown menu
  $('#dropdownmenu > li').click(function(e){
    e.preventDefault();
    var selected = $(this).text();
    $('#tlds').val(selected);
    $('#tld-display').text(selected);
  });
});
