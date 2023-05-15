var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/registration', { title: 'Darkom | Registration',session: req.session })
// });
router.get('/',function(req, res, next) {
  console.log("isLoogedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/registration', { title: 'Darkom | Registration' ,loggedIn:false})
  } else {
    res.redirect('/');
  }
});

module.exports = router;
