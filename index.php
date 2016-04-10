<?php

// Load config and inject current version string
$config = json_decode(file_get_contents('config.json'));
$config->version = file_get_contents('VERSION');

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
