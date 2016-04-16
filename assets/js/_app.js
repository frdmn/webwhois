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
      // Remove 'single', add 'multi' CSS class
      $('form').removeClass('single').addClass('multi');
      // Show tld-package dropdown
      $('#tld-package').show();
      // Show '.' input group addon
      $('#dot').show();
      return true;
    } else if (state === 'hide') {
      // Remove 'multi', add 'single' CSS class
      $('form').removeClass('multi').addClass('single');
      // Hide tld-package dropdown
      $('#tld-package').hide();
      // Hide '.' input group addon
      $('#dot').hide();
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

    $.get('api/lookup/single/' + domain, function(data){
      return callback(data);
    });
  }

  /**
   * Function to lookup a multiple domains (TLDs)
   * via POST /api/lookup/mutli
   * @return {Boolean} true
   */
  var submitMultiLookup = function(callback){
    var domain = $('#your-domain').val(),
        tlds = $('input#tlds').val();

    $.post( 'api/lookup/multi', { domain: domain, tlds: tlds}, function( data ) {
      return callback(data);
    });
 }

 /**
   * Fill lookup results in <table>
   * @param  {Object} data result data
   * @return {Object} jQuery object
   */
  var populateResultTable = function(data){
    var htmlData = {};

    // For each domain lookup result
    for (var domain in data) {
      // Check for success
      if (data[domain].status === 'success') {
        // Append new table <tr> in htmlData
        htmlData += '<tr><th scope="row">' + domain + '</th><td>' + data[domain].registered + '</td></tr>';
      } else {
        console.log('Error', data[domain])
      }
    }

    return $('table.lookup-results tbody').html(htmlData);
  }

  /**
   * Display given error message in Bootstrap alert
   * @param  {String} msg
   * @return {Object} jQuery object
   */
  var displayErrorMessage = function(msg){
    $('div.error-container').html('<div class="alert alert-danger" role="alert"><strong>Error</strong>: ' + msg + ' </div>');

    return toggleErrorContainer('show');
  }

  /**
   * Toggle error container
   * @param  {String} state "hide" or "show"
   * @return {Boolean}
   */
  var toggleErrorContainer = function (state){
    if (state === 'show') {
      $('.error-container').show();
      return true;
    } else if (state === 'hide') {
      $('.error-container').hide();
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

    // Hide loading spinner on page load
    toggleResultsTable('hide');
  });

  // Request lookup, when single form is active
  $('.row').on('click', 'form.single .submit', function(e){
    // Hide lookup results table and error container
    toggleResultsTable('hide');
    toggleErrorContainer('hide');

    // Create ladda (loading spinner) instance and start spinning
    var ladda = Ladda.create(this);
    ladda.start();

    submitSingleLookup(function(cb){
      if (cb.status === 'success') {
        // Populate result table with API response data
        populateResultTable(cb.data);

        // Show lookup results table and stop loading spinner
        toggleResultsTable('show');
        ladda.stop();
      } else {
        // Display possible errors
        displayErrorMessage(cb.message);

        // Stop loading spinner
        ladda.stop();
      }
    });
  });

  // Request lookup, when multi form is active
  $('.row').on('click', 'form.multi .submit', function(e){
    // Hide lookup results table and error container
    toggleResultsTable('hide');
    toggleErrorContainer('hide');

    // Create ladda (loading spinner) instance and start spinning
    var ladda = Ladda.create(this);
    ladda.start();

    submitMultiLookup(function(cb){
      if (cb.status === 'success') {
        // Populate result table with API response data
        populateResultTable(cb.data);

        // Show lookup results table and stop loading spinner
        toggleResultsTable('show');
        ladda.stop();
      } else {
        // Display possible errors
        displayErrorMessage(cb.message);

        // Stop loading spinner
        ladda.stop();
      }
    });
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
  }).keydown(function(event){
    if(event.keyCode == 13) {
      // Prevent form default action
      event.preventDefault();

      // "Click" submit button
      $('.submit').click();
    }
  });

  // Update fake "select" when user clicks on package in dropdown menu
  $('#dropdownmenu > li').click(function(e){
    e.preventDefault();

    var selectedDisplayName = $(this).text();
    var selectedTlds = $(this).data('tlds');
    $('#tld-display').text(selectedDisplayName);
    $('#tlds').val(selectedTlds);
  });
});
