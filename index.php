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

// Initialize Slim instance
$app = new \Slim\App;

// Set routes
$app->get('/', 'dashboard');
$app->get('/api', 'routeGetOverview');

// Run application
$app->run();
