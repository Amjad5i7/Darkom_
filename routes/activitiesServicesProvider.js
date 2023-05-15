var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/activities-services-provider', { title: 'Darkom | Activities',loggedIn:true })
// });
router.get('/',function(req, res, next) {
  console.log("isLoogedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/activities-services-provider', { title: 'Darkom | Activities' ,loggedIn:false})
  } else {
    res.render('pages/activities-services-provider', { title: 'Darkom | Activities' ,loggedIn:true})
  }
});
module.exports = router;