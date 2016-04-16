<?php

// Standard exception data
$jsonObject = array(
  'status' => 'success'
);

/**
 * Route - "GET /"
 *
 * The default dashboard route
 * @return {String} HTML DOM
 */
function dashboard() {
  global $templates;

  return $templates->render('partials::dashboard');
}

/**
 * Route - "GET /api"
 *
 * Display a general API overview
 * @return {String} JSON response
 */
function routeApiOverview() {
  global $jsonObject;

  // Create array with available routes
  $routes = array(
    'GET /api' => 'This API overview',
    'GET /api/tlds' => 'List all available TLDs',
    'GET /api/lookup/single/{domain}' => 'Check availablity of a single domain',
    'POST /api/lookup/multi' => 'Check availablity of multiple domain (TLDs)',
    'GET /api/whois/{domain}' => 'Whois a single domain'
  );

  $jsonObject['data'] = $routes;

  return json_encode($jsonObject);
}

/**
 * Route - "GET /api/tlds"
 *
 * List all available TLDs
 * @return {String} JSON response
 */
function routeApiGetTlds() {
  global $jsonObject, $config;

  // Create array with available routes
  $jsonObject['data'] = $config->tlds;

  return json_encode($jsonObject);
}

/**
 * Route - "GET /api/lookup/single/:domain"
 *
 * Lookup a single domain
 * @param  {ServerRequestInterface} $request
 * @param  {ResponseInterface} $response
 * @param  {Array} $args
 * @return {String} JSON response
 */
function routeApiGetLookupSingle($request, $response, $args) {
  global $jsonObject, $config;

  // Parse domain from request path
  $domain = filter_var($args['domain'], FILTER_SANITIZE_STRING);
  $domainParts = explode('.', $domain);

  if (count($domainParts) !== 2 || empty($domainParts[0]) || empty($domainParts[1]) ) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Invalid domain name';
    return json_encode($jsonObject);
  }

  // Check if TLD is allowed
  if (!isTldAllowed($config, $domainParts[1])) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Requested TLD is not allowed for lookups';
    return json_encode($jsonObject);
  }

  // Check if domain is registered
  $status = checkIfRegistered($domain);

  // Make sure there was no problem during the lookup
  if (!$status) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Problem while trying to lookup whois';
    return json_encode($jsonObject);
  }

  $jsonObject['data'][$domain]['status'] = 'success';

  // Evaluate $status
  if ($status === 'yes') {
    $jsonObject['data'][$domain]['registered'] = true;
  } elseif ($status === 'no') {
    $jsonObject['data'][$domain]['registered'] = false;
  } else {
    $jsonObject['data'][$domain]['registered'] = $status;
  }

  return json_encode($jsonObject);
}

/**
 * Route - "POST /api/lookup/multi"
 *
 * Whois multiple domain TLDs
 * @param  {ServerRequestInterface} $request
 * @param  {ResponseInterface} $response
 * @param  {Array} $args
 * @return {String} JSON response
 */
function routeApiPostLookupMulti($request, $response, $args) {
  global $jsonObject, $config;

  // Parse POST parameter
  $postBody = $request->getParsedBody();

  // Check for "domain"
  if (!$postBody['domain'] || empty($postBody['domain'])) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Couldn\'t find "domain" parameter';
    return json_encode($jsonObject);
  }

  // and for "tlds"
  if (!$postBody['tlds'] || empty($postBody['tlds'])) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Couldn\'t find "tlds" parameter';
    return json_encode($jsonObject);
  }

  // Split by ","
  $tlds = explode(',', str_replace(' ', '', $postBody['tlds']));
  $results = [];

  // Loop through each given TLD
  foreach ($tlds as $tld) {
    $tldJsonObject = array();

    $domain = filter_var($postBody['domain'], FILTER_SANITIZE_STRING);
    $tld = filter_var($tld, FILTER_SANITIZE_STRING);

    // Construct full domain with TLD suffix
    $domain = $domain.'.'.$tld;

    // Check for valid TLD
    if (!$tld) {
      $tldJsonObject['status'] = 'error';
      $tldJsonObject['message'] = 'Invalid TLD';
      $results[$domain] = $tldJsonObject;
      continue;
    }

    // Check if TLD is allowed
    if (!isTldAllowed($config, $tld)) {
      $tldJsonObject['status'] = 'error';
      $tldJsonObject['message'] = 'Requested TLD is not allowed for lookups';
      $results[$domain] = $tldJsonObject;
      continue;
    }

    // Check if domain is registered
    $status = checkIfRegistered($domain);

    // Make sure there was no problem during the lookup
    if (!$status) {
      $tldJsonObject['status'] = 'error';
      $tldJsonObject['message'] = 'Problem while trying to lookup whois';
    } else {
      $tldJsonObject['status'] = 'success';
    }

    // Evaluate $status
    if ($status === 'yes') {
      $tldJsonObject['registered'] = true;
    } elseif ($status === 'no') {
      $tldJsonObject['registered'] = false;
    } else {
      $tldJsonObject['registered'] = $status;
    }

    // Push $tldJsonObject into the $results array using the domain as key
    $results[$domain] = $tldJsonObject;
  }

  // Push results array into "data" JSON
  $jsonObject['data'] = $results;

  return json_encode($jsonObject);
}

/**
 * Route - "GET /api/whois/:domain"
 *
 * Whois a single domain
 * @param  {ServerRequestInterface} $request
 * @param  {ResponseInterface} $response
 * @param  {Array} $args
 * @return {String} JSON response
 */
function routeApiGetWhois($request, $response, $args) {
  global $jsonObject, $config;

  // Parse domain from request path
  $domain = filter_var($args['domain'], FILTER_SANITIZE_STRING);
  $domainParts = explode('.', $domain);

  // Check if TLD is allowed
  if (!isTldAllowed($config, $domainParts[1])) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Requested TLD is not allowed for lookups';
    return json_encode($jsonObject);
  }

  if (count($domainParts) !== 2 || empty($domainParts[0]) || empty($domainParts[1]) ) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Invalid domain name';
    return json_encode($jsonObject);
  }

  // Check if domain is registered
  $whoisData = runWhoisLookup($domain);

  // Make sure there was no problem during the lookup
  if (!$whoisData) {
    $jsonObject['status'] = 'error';
    $jsonObject['message'] = 'Problem while trying to whois domain';
  }

  $jsonObject['data'] = $whoisData;

  return json_encode($jsonObject);
}
