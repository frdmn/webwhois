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

  /**
   * Hide the TLD/package form (dropdown)
   * @return {Boolean} true
   */
  var hideMultiLookupForm = function(){
    $('form').removeClass('multi').addClass('single');
    $('#tld-package').hide();
    $('#dot').hide();
    return true;
  }

  /**
   * Show the TLD/package form (dropdown)
   * @return {Boolean} true
   */
  var showMultiLookupForm = function(){
    $('form').removeClass('single').addClass('multi');
    $('#tld-package').show();
    $('#dot').show();
    return true;
  }

  /**
   * Toggle (hide and show) the spinning loading
   * wheel instead of the submit button
   * @param  {String} state "hide" or "show"
   * @return {Boolean}
   */
  var toggleLoadingSpinner = function(state){
    if (state === 'show') {
      $('.spinner').show();
      $('.submit').hide();
      return true;
    } else if (state === 'hide') {
      $('.spinner').show();
      $('.submit').hide();
      return true;
    } else {
      return false;
    }
  }

  // Make sure to load config file
  loadConfigFile(function(config){
    // Insert the first domain package in the hidden input
    var defaultTlds = $('#dropdownmenu > li').first().data('tlds');
    $('#tlds').val(getDefaultSelectionTlds(config));
    $('#tld-display').text(config.general['default-selection']);
  });

  // Listen on each keypress in the domain input
  $('#your-domain').keyup(function() {
    var input = $('#your-domain').val();

    // Check if it contains a dot
    if (input.indexOf('.') > -1) {
      hideMultiLookupForm();
    } else {
      showMultiLookupForm();
    }
  });

  // Update fake "select" when user clicks on package in dropdown menu
  $('#dropdownmenu > li').click(function(e){
    e.preventDefault();
    var selected = $(this).text();
    $('#tlds').val(selected);
    $('#tld-display').text(selected);
  });
});
