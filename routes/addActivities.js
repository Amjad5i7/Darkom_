var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/add-activities', { title: 'Darkom | Add Activity',loggedIn:true})
// });
router.get('/',function(req, res, next) {
  console.log("isLoogedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) {
    res.redirect('/login')
    // res.render('pages/add-activities', { title: 'Darkom | Add Activity' ,loggedIn:false})
  } else {
    res.render('pages/add-activities', { title: 'Darkom | Add Activity' ,loggedIn:true,user:req.session.user})
  }
});

module.exports = router;