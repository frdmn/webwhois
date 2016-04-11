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

/**
 * Route - "GET /api" - to display an API route overview
 * @return void
 */
function routeApiOverview() {
  global $jsonObject;

  // Create array with available routes
  $routes = array(
    'GET /api' => 'This API overview',
    'GET /api/tlds' => 'List all available TLDs',
    'POST /api/lookup' => 'Get warranty with ID \'[ID]\''
    );

  $jsonObject['data'] = $routes;

  echo json_encode($jsonObject);
}

/**
 * Route - "GET /api/tlds" - list all available TLDs
 * @return void
 */
function routeApiGetTlds() {
  global $jsonObject, $config;

  // Create array with available routes
  $jsonObject['data'] = $config->tlds;

  echo json_encode($jsonObject);
}

/**
 * Route - "POST /api/tlds" - list all available TLDs
 * @return void
 */
function routeApiPostLookup($request) {
  global $jsonObject, $app;

  $postBody = $request->getParsedBody();

  if (!$postBody['domain']) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Couldn\'t find \'domain\' parameter';
  }

  if (!$postBody['tlds']) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Couldn\'t find \'tlds\' parameter';
  }

  // TODO: whois and return results

  echo json_encode($jsonObject);
}
