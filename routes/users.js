var express = require('express');
var router = express.Router();
var apiService = require('../services/apiService');
var UserSchema = require('../schema/api/users');
var ReservationSchema = require('../schema/api/reservation');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/profile', async function(req, res, next) {
  // console.log("userProfile--->",req.session.user)
  if (req.session.user == undefined || req.session.user == {}) {
    res.redirect('/');
  } else {
    let userId = req.session.user._id;
    if ( req.session.user.user_type == 'visitor') {
      const userProfile = await UserSchema.findById({ _id: userId });
      const pastReservation = await ReservationSchema.find({ visitorId: userId });
      console.log("userProfile--->",userProfile)
      console.log("pastReservation--->",pastReservation)
      if (!userProfile){
        return res.send('User not found');
      }
      res.render('pages/servieceproviderprofile', { title: 'Darkom | Profile' ,loggedIn:true,data: userProfile,reservation:pastReservation})
      
    } else if(req.session.user.user_type == 'service_provider') {
      const userProfile = await UserSchema.findById({ _id: userId });
      const pastReservation = await ReservationSchema.find({ providerId: userId });
      console.log("userProfile--->",userProfile)
      console.log("pastReservation--->",pastReservation)
      if (!userProfile){
        return res.send('User not found');
      }
      res.render('pages/servieceproviderprofile', { title: 'Darkom | Profile' ,loggedIn:true,data: userProfile,reservation:pastReservation})
      
      
    }
   
    
  }
  //res.send('respond with a resource');
});

module.exports = router;