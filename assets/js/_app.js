$(function() {
  // Insert the first domain package in the hidden input
  var defaultPackage=$('#dropdownmenu > li').first().text();
  $('#dropdowninput').val(defaultPackage);

  // Update fake "select" when user clicks on package in dropdown menu
  $('#dropdownmenu > li').click(function(e){
    e.preventDefault();
    var selected = $(this).text();
    $('#dropdowninput').val(selected);
    $('#dropdowndisplay').text(selected);
  });
});
