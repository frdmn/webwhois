// Require modules
var express = require('express')
    , router = express.Router()
    , recaptcha = require('express-recaptcha');

/**
 * Route - "GET /" (actual frontend)
 *
 * Lookup a single domain name
 * @param req
 * @param res
 * @param next
 * @return {String} JSON response
 */
router.get('/', recaptcha.middleware.render, function(req, res, next) {
  res.render('index', {
    title: 'Dashboard'
    , config: req.app.locals.configuration
    , captcha: req.recaptcha
  });
});

module.exports = router;
