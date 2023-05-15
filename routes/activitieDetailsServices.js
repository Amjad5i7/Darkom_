var express = require('express');
var router = express.Router();

var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/activity-details-services', { title: 'Darkom | Details' ,loggedIn:true })
// });
router.get('/',async function(req, res, next) {
  const serviceId = req.baseUrl.split('/')[2];
  console.log("serviceId",serviceId);
  console.log("isLoogedInActivityDetailsServicesLogSee--->",req.session.user);
  const activityDetails = await ServiceSchema.findOne({ _id: serviceId,isDelete:false }).sort({ _id: -1 });
  // console.log("planDetails",planDetails);
  const providerinfo = await UserSchema.findById({_id:activityDetails.providerId}).exec();
  // console.log("providerinfo",providerinfo);
  let providerName = providerinfo.firstName + ' '+providerinfo.lastName;
    let providerPic = providerinfo.profilePic;
    let providerBio = providerinfo.bio;
    let providerAddress = providerinfo.address;
    let providerwpLink = providerinfo.wpLink;
    let activityObj ={
      id:activityDetails._id,
      providerId:activityDetails.providerId,
      providerName:providerName,
      providerPic:providerPic,
      providerBio:providerBio,
      providerAddress:providerAddress,
      providerwpLink:providerwpLink,
      serviceType:activityDetails.serviceType,
      serviceName:activityDetails.serviceName,
      description:activityDetails.description,
      numOfVisitors:activityDetails.numOfVisitors,
      fromDate:activityDetails.fromDate,
      toDate:activityDetails.toDate,
      price:activityDetails.price,
      images:activityDetails.images,
      activities:activityDetails.activities
    }
    console.log("activityObj",activityObj);
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/activity-details-services', { title: 'Darkom | Details' ,loggedIn:false,data:activityObj})
  } else {
    res.render('pages/activity-details-services', { title: 'Darkom | Details' ,loggedIn:true,data:activityObj})
  }
});

module.exports = router;