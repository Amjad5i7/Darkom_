var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/registrationSuccess', { title: 'Darkom | RegistrationSuccess' ,session: req.session})
});

module.exports = router;