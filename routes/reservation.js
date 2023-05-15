var express = require('express');
var router = express.Router();
var ServiceSchema = require('../schema/api/services');
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/reservation', { title: 'Darkom | Reservation' ,loggedIn:true})
// });
router.get('/',async function(req, res, next) {
  const reservationId = req.baseUrl.split('/')[2];
  // console.log("reservationId",reservationId);
  console.log("isLoogedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/login', {  title: 'Darkom | Login',loggedIn:false})
  } else {
  const reservationDetails = await ServiceSchema.findOne({ _id: reservationId,isDelete:false }).sort({ _id: -1 });

  let reservationDetailsObj = {
    reservationId:reservationId,
    providerId:reservationDetails.providerId,
    serviceType:reservationDetails.serviceType,
    serviceName:reservationDetails.serviceName,
    description:reservationDetails.description,
    numOfVisitors:reservationDetails.numOfVisitors,
    fromDate:reservationDetails.fromDate,
    toDate:reservationDetails.toDate,
    price:reservationDetails.price,
    visitorId:req.session.user._id,
    firstName:req.session.user.firstName,
    lastName:req.session.user.lastName,
    email:req.session.user.email,
    phoneNumber:req.session.user.phoneNumber,
    dob:req.session.user.dob,
    address:req.session.user.address,
    national_id:req.session.user.national_id
  }
  console.log("reservationDetailsObj",reservationDetailsObj)
    res.render('pages/reservation', { title: 'Darkom | Reservation',loggedIn:true,data:reservationDetailsObj})
  }
});

module.exports = router;
