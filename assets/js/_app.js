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
   * Toggle the TLD/package form (dropdown)
   * @param  {String} state "hide" or "show"
   * @return {Boolean}
   */
  var toggleMultiLookupForm = function(state){
    if (state === 'show') {
      $('form').removeClass('single').addClass('multi');
      $('#tld-package').show();
      $('#dot').show();
      return true;
    } else if (state === 'hide') {
      $('form').removeClass('multi').addClass('single');
      $('#tld-package').hide();
      $('#dot').hide();
      return true;
    } else {
      return false;
    }
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
      $('.spinner').hide();
      $('.submit').show();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Toggle (show and hide) the lookup
   * results table
   * @param  {String} state "hide" or "show"
   * @return {Boolean}
   */
  var toggleResultsTable = function (state){
    if (state === 'show') {
      $('.lookup-results').show();
      return true;
    } else if (state === 'hide') {
      $('.lookup-results').hide();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function to lookup a single domain
   * name via GET /api/lookup/single/{domain}
   * @return {Boolean} true
   */
  var submitSingleLookup = function(callback){
    var domain = $('#your-domain').val();

    toggleResultsTable('hide');
    toggleLoadingSpinner('show');

    $.get('api/lookup/single/' + domain, function(data){
      toggleResultsTable('show');
      toggleLoadingSpinner('hide');

      return callback(data);
    });
  }

  /**
   * Function to lookup a multiple domains (TLDs)
   * via POST /api/lookup/mutli
   * @return {Boolean} true
   */
  var submitMultiLookup = function(){
    console.log('multi');
    return true;
  }

 /**
   * Fill lookup results in <table>
   * @param  {Object} data result data
   * @return {Object} jQuery object
   */
  var populateResultTable = function(data){
    var htmlData = {},
        i = 0;

    for (var domain in data) {
      if (data[domain].status === 'success') {
        htmlData += '<tr><th scope="row">' + domain + '</th><td>' + data[domain].registered + '</td></tr>';
      }
      i++;
    }

    return $('table.lookup-results tbody').html(htmlData);
  }

  /**
   * Display given error message in Bootstrap alert
   * @param  {String} msg
   * @return {Object} jQuery object
   */
  var displayErrorMessage = function(msg){
    return $('div.error-container').html('<div class="alert alert-danger" role="alert"><strong>Error</strong>: ' + msg + ' </div>');
  }

  // Make sure to load config file
  loadConfigFile(function(config){
    // Insert the first domain package in the hidden input
    var defaultTlds = $('#dropdownmenu > li').first().data('tlds');
    $('#tlds').val(getDefaultSelectionTlds(config));
    $('#tld-display').text(config.general['default-selection']);

    // Hide loading spinner on page load
    toggleLoadingSpinner('hide');
    toggleResultsTable('hide');
  });

  // Request lookup, when single form is active
  $('.row').on('click', 'form.single button.submit', function(e){
    e.preventDefault();
    submitSingleLookup(function(cb){
      if (cb.status === 'success') {
        var result = cb.data;
        populateResultTable(result);
      } else {
        displayErrorMessage(cb.status.message);
      }
    });
  });

  // Request lookup, when multi form is active
  $('.row').on('click', 'form.multi button.submit', function(e){
    e.preventDefault();
    toggleLoadingSpinner('show');
    submitMultiLookup();
  });

  // Listen on each keypress in the domain input
  $('#your-domain').keyup(function() {
    var input = $('#your-domain').val();

    // Check if it contains a dot
    if (input.indexOf('.') > -1) {
      toggleMultiLookupForm('hide');
    } else {
      toggleMultiLookupForm('show');
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
