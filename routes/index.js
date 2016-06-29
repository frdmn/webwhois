var express = require('express')
    , router = express.Router()
    , recaptcha = require('express-recaptcha');

/* GET home page. */
router.get('/', recaptcha.middleware.render, function(req, res, next) {
  res.render('index', {
    title: 'Dashboard',
    config: req.app.locals.configuration,
    captcha: req.recaptcha
  });
});

module.exports = router;
