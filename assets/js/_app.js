$(function() {

  // Insert the first domain package in the hidden input
  var defaultTlds=$('#dropdownmenu > li').first().data('tlds');
  $('#tlds').val(defaultTlds);

  // Update fake "select" when user clicks on package in dropdown menu
  $('#dropdownmenu > li').click(function(e){
    e.preventDefault();
    var selected = $(this).text();
    $('#tlds').val(selected);
    $('#tld-display').text(selected);
  });
});
