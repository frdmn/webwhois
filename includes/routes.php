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

// API

/**
 * Route - "GET /api" - to display an API route overview
 * @return void
 */
function routeGetOverview() {
  global $jsonObject;

  // Create array with available routes
  $routes = array(
    'GET /api' => 'This API overview',
    // 'GET /api/tlds' => 'List all available TLDs',
    // 'POST /api/lookup' => 'Get warranty with ID \'[ID]\''
    );

  $jsonObject['data'] = $routes;

  echo json_encode($jsonObject);
}
