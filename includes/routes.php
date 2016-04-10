<?php

/* General */

// Standard exception data
$jsonObject = array(
  'status' => 'success'
);

/* Routes */

/**
 * Route - "GET /"
 * @return void
 */
function dashboard() {
  global $templates;
  echo $templates->render('partials::dashboard');
}
