var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/',function(req, res, next) {
  console.log("isLoogedInAboutLogSee--->",req.session.user);
  if (req.session.user == undefined ) {
    res.render('pages/about', {title: 'Darkom | About Us',loggedIn:false})
  } else {
    res.render('pages/about', { title: 'Darkom | About Us',loggedIn:true})
  }
 
});
module.exports = router;
