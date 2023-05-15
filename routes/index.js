var express = require('express');
var router = express.Router();
var apiService = require('../services/apiService')
var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');
// router.get('/',isLoogedIn,apiService.getFourActivitiesHome);
router.get('/',async function(req, res, next) {
  const serviceOfActivity = await ServiceSchema.find({ serviceType: "activity",isDelete:false }).sort({ _id: -1 }).limit(4);
  
  let activityList=[];
  for (const singleServices of serviceOfActivity) {
    const providerinfo = await UserSchema.findById({_id:singleServices.providerId}).exec();
    let providerName = providerinfo.firstName + ' '+providerinfo.lastName;
    let providerPic = providerinfo.profilePic;
    let activityObj ={
      id:singleServices._id,
      providerId:singleServices.providerId,
      providerName:providerName,
      providerPic:providerPic,
      serviceType:singleServices.serviceType,
      serviceName:singleServices.serviceName,
      description:singleServices.description,
      numOfVisitors:singleServices.numOfVisitors,
      fromDate:singleServices.fromDate,
      toDate:singleServices.toDate,
      price:singleServices.price,
      images:singleServices.images,
      activities:singleServices.activities
    }
    activityList.push(activityObj);
  }
  console.log("activityList",activityList);
  console.log("isLoogedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined ) {
    res.render('pages/home', {title: 'Darkom | Home Page',loggedIn:false,homeActivity: activityList})
  } else {
    res.render('pages/home', { title: 'Darkom | Home Page',loggedIn:true,homeActivity: activityList})
  }
})
// function isLoogedIn(req, res, next) {
//   console.log("isLoogedInuserLogSee--->",req.session.user);
//   if (req.session.user == undefined || req.session.user == {}) {
//     res.render('pages/home', {title: 'Darkom | Home Page',loggedIn:false})
//   } else {
//     res.render('pages/home', { title: 'Darkom | Home Page',loggedIn:true})
//   }
//   next()
// }
// const { ensureAuthenticated, forwardAuthenticated } = require('../passport-auth');

// /* GET home page. */
// router.get('/',function(req, res, next) {
//   const sessionuser = req.user;
//   console.log("sessionuser",sessionuser)
//   //res.render('pages/home', { url: 'pageone', title: 'Darkom | Home Page', baseUrl: req.baseUrl,user:req.user })
//   // res.render('pages/home', { title: 'Darkom | Home Page ' });
//   res.render('pages/home', { url: 'pageone', title: 'Darkom | Home Page',loggedIn:false, baseUrl: req.baseUrl,user:sessionuser})
// });

router.get('/aboutUs', function(req, res, next) {
  res.render('aboutUs', { title: 'About Us',user: req.session });
});
router.get('/logout', function(req, res, next) {
  req.session.user = undefined;
  res.redirect('/');
});
router.get('/forgot-password-one', function(req, res, next) {
  
  if (req.session.user == undefined ) {
    res.render('pages/forgot-password-one', { title: ' Darkom | Reset Passward',loggedIn:false,user: req.session.user})
  } else {
   res.render('pages/forgot-password-one', { title: ' Darkom | Reset Passward',loggedIn:true,user: req.session.user})
  }
});
router.get('/forgot-password-two/:id', function(req, res, next) {
  // console.log("baseUrl",req.params.id);
  const passwordId = req.params.id;
  console.log("passwordId",passwordId);
  // let userId = passwordId.split('$')[0];
  // let resetToken = passwordId.split('$')[1];
  // console.log("userId",userId);
  // console.log("resetToken",resetToken);
  if (req.session.user == undefined ) {
    res.render('pages/forgot-password-two', { title: ' Darkom | Reset Passward',loggedIn:false,resetId: passwordId})
  } else {
   res.render('pages/forgot-password-two', { title: ' Darkom | Reset Passward',loggedIn:true,resetId: passwordId})
  }
});


module.exports = router;
