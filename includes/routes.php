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
    'GET /api/lookup/single/{domain}' => 'Whois a single domain',
    'POST /api/lookup/multi' => 'Whois multiple domain TLDs'
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
 * Route - "GET /api/lookup/single/:domain" - Lookup a single domain
 * @return void
 */
function routeApiGetLookupSingle($request, $response, $args) {
  global $jsonObject;

  $domain = $args['domain'];
  $status = checkIfRegistered($domain);

  if (!$status) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Problem while trying to lookup whois';
  }

  if ($status === 'yes') {
    $jsonObject['data']['registered'] = true;
  } elseif ($status === 'yes') {
    $jsonObject['data']['registered'] = false;
  } else {
    $jsonObject['data']['registered'] = $status;
  }

  echo json_encode($jsonObject);
}

/**
 * Route - "POST /api/lookup/multi" - Whois multiple domain TLDs
 * @return void
 */
function routeApiPostLookupMulti($request, $response, $args) {
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

  $tlds = explode(', ', $postBody['tlds']);
  $results = [];

  foreach ($tlds as $tld) {
    $domain = $postBody['domain'].'.'.$tld;
    $status = checkIfRegistered($domain);
    $tldJsonObject = array();

    if (!$status) {
      $tldJsonObject['status'] = 'error';
      $tldJsonObject['message'] = 'Problem while trying to lookup whois';
    } else {
      $tldJsonObject['status'] = 'success';
    }

    if ($status === 'yes') {
      $tldJsonObject['registered'] = true;
    } elseif ($status === 'yes') {
      $tldJsonObject['registered'] = false;
    } else {
      $tldJsonObject['registered'] = $status;
    }

    $results[$domain] = $tldJsonObject;
  }

  $jsonObject['data'] = $results;

  echo json_encode($jsonObject);
}
