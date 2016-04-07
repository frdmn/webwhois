<?php

// Set env varibales
define('GENERAL_VERSION', '1.0.0');
define('GENERAL_TITLE', 'Test');

// Autoload composer components
require 'vendor/autoload.php';

// Load route functions
include('includes/routes.php');

// Initialize new Plates instance and map template folders
$templates = new League\Plates\Engine('templates');
$templates->addFolder('partials', 'templates/partials');

// Initialize Slim instance
$app = new \Slim\App;

// Set routes
$app->get('/', 'dashboard');

// Run application
$app->run();
