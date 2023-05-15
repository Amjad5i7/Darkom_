var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/add-plan', { title: 'Darkom | Add Plan',loggedIn:true})
// });
router.get('/',function(req, res, next) {
  console.log("isLoogedInAddPlanLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) {
    res.redirect('/login')
    //res.render('pages/add-plan', { title: 'Darkom | Add Plan' ,loggedIn:false,user:{}})
  } else {
    res.render('pages/add-plan', { title: 'Darkom | Add Plan' ,loggedIn:true,user:req.session.user})
  }
});

module.exports = router;