<?php
  $this->layout('layout', ['title' => 'Dashboard']);
  global $config;
?>

<div class="row">
  <form method="post">
    <fieldset>
      <!-- Form Name -->
      <legend>Domain search</legend>

      <div class="form-inputs">
        <div class="input-group">
          <span class="input-group-addon">www.</span>
          <input type="text" class="form-control" id="your-domain" name="your-domain" placeholder="Your domain">
          <span class="input-group-addon" id="dot">.</span>
          <div class="input-group-btn">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span id="dropdowndisplay">de</span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" id="dropdownmenu">
              <?php foreach ($config->tldpackages as $pkgname => $pkg): ?>
                <li data-package="<?= getIntegerIndexOfObjectKey($config->tldpackages, $pkgname) ?>"><a href="#"><?= $this->e($pkgname) ?></a></li>
              <?php endforeach; ?>
              <li role="separator" class="divider"></li>
              <?php foreach ($config->tlds as $index => $tld): ?>
                <li data-tld="<?= $index ?>"><a href="#"><?= $this->e($tld) ?></a></li>
              <?php endforeach; ?>
            </ul><!-- /.dropdown-menu -->
            <input type="hidden" id="dropdowninput" name="tldpackage">
          </div><!-- /.input-group-btn -->
        </div><!-- /.input-group -->
        <hr>
      </div><!-- /.form-inputs -->
    </fieldset>
    <button type="submit" class="btn btn-primary">Search</button>
  </form>
</div><!-- /.row -->
