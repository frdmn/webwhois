<?php

// Load config and inject current version string
$config = json_decode(file_get_contents('config.json'));
$config->version = file_get_contents('VERSION');

// Autoload composer components
require 'vendor/autoload.php';

// Load routes and functions
include('includes/routes.php');
include('includes/functions.php');

// Initialize new Plates instance and map template folders
$templates = new League\Plates\Engine('templates');
$templates->addFolder('partials', 'templates/partials');

// Custom middleware inject some headers
$headerMiddleware = function ($request, $response, $next) {
  $response = $next($request, $response);

  // Add default security header
  $response = $response->withHeader('X-Frame-Options', 'SAMEORIGIN');
  $response = $response->withHeader('X-Content-Type-Options', 'nosniff');
  $response = $response->withHeader('X-XSS-Protection', '1; mode=block');
  $response = $response->withHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline';");

  // If API request succeeded, add CORS headers and always return as JSON
  $reqIsAPI = (bool) preg_match('|^/api|', $request->getUri()->getPath());
  $resIsOk = $response->getStatusCode();

  if ($reqIsAPI && $resIsOk === 200) {
    $response = $response->withHeader('Content-Type', 'application/json');
    $response = $response->withHeader('Access-Control-Allow-Methods', '*');
    $response = $response->withHeader('Access-Control-Allow-Origin', '*');
  }

  return $response;
};

// Initialize Slim instance
$app = new \Slim\App;

// Add header middleware
$app->add($headerMiddleware);

// Set routes
$app->get('/', 'dashboard');
$app->get('/api', 'routeApiOverview');
$app->get('/api/tlds', 'routeApiGetTlds');

// Run application
$app->run();
