<?php
  $this->layout('layout', ['title' => 'Dashboard']);
  global $config;
?>

<div class="row">
  <div class="error-container">
  </div>
  <form method="post" class="multi">
    <fieldset>
      <!-- Form Name -->
      <legend>Domain lookup <button class="btn btn-xs btn-primary pull-right submit">Lookup</button><img class="spinner pull-right" src="assets/icons/spinner.svg" width="24" height="24"></legend>

      <div class="form-inputs">
        <div class="input-group">
          <span class="input-group-addon">www.</span>
          <input type="text" class="form-control" id="your-domain" name="your-domain" placeholder="yourdomain">
          <span class="input-group-addon" id="dot">.</span>
          <div class="input-group-btn" id="tld-package">
            <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span id="tld-display"></span> <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" id="dropdownmenu">
              <?php foreach ($config->tldpackages as $pkgname => $pkg): ?>
                <li data-tlds="<?= join(', ', $pkg->tlds) ?>"><a href="#"><?= $this->e($pkgname) ?></a></li>
              <?php endforeach; ?>
              <li role="separator" class="divider"></li>
              <?php foreach ($config->tlds as $index => $tld): ?>
                <li data-tlds="<?= $this->e($tld) ?>"><a href="#"><?= $this->e($tld) ?></a></li>
              <?php endforeach; ?>
            </ul><!-- /.dropdown-menu -->
            <input type="hidden" id="tlds" name="tlds">
          </div><!-- /.input-group-btn -->
        </div><!-- /.input-group -->
      </div><!-- /.form-inputs -->
    </fieldset>
  </form>
  <hr>
  <table class="table lookup-results">
    <thead>
      <tr>
        <th class="col-md-10">Domain</th>
        <th class="col-md-2">Registered</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div><!-- /.row -->
