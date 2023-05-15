// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect('/')
//   }
//   res.render('pages/login', { title: 'Darkom | Login',session: req.session,loggedIn:false })
// });
// function checkAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next()
//   }

//   res.redirect('/')
// }

// function checkNotAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return res.redirect('/')
//   }
//   next()
// }
// module.exports = router;
const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/',function(req, res, next) {
  console.log("isLoogedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/login', { title: 'Darkom | Login' ,loggedIn:false})
  } else {
    res.redirect('/');
  }
});
// router.get('/', (req, res, next) => {
//   console.log("userLog--->",req.user)
//   res.render('pages/login', { title: 'Darkom | Login',user: req.user,loggedIn:false })
// });
// router.post('/', (req, res, next) => {
//   console.log("userLog--->",req.user)
//   passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
//   })(req, res, next);
// });
module.exports = router;
