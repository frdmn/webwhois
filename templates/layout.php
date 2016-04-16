<?php global $config; ?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->
    <meta name="description" content="<?= $config->general->description ?>">
    <meta name="author" content="Jonas Friedmann <j@frd.mn>">

    <title><?= $config->general->title ?> - <?= $this->e($title) ?></title>

    <!-- Compiled CSS -->
    <link href="assets/css/style.css" rel="stylesheet">
  </head>

  <body>

    <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#"><?= $config->general->title ?></a>
        </div>
        <div id="navbar" class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li class="active"><a href="#">Dashboard</a></li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </nav>

    <div class="container">
      <?=$this->section('content')?>
    </div><!-- /.container -->

    <footer class="footer">
      <div class="container">
        <p class="text-muted pull-left">Made by <strong><a href="https://frd.mn" target="_blank" href="#">frdmn</a></strong> under <a href="LICENSE">MIT</a> license.</p>
        <p class="text-muted pull-right"><i class="icon-large icon-github"></i><a href="https://github.com/frdmn/webwhois" target="_blank">webwhois</a> version <?= $config->version ?></p>
      </div>
    </footer>

    <script src="assets/js/build.js"></script>
  </body>
</html>
