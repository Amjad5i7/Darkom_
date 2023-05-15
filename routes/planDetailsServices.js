var express = require('express');
var router = express.Router();

var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');
router.get('/',async function(req, res, next) {
  // var planId = req.params.planId;
  // console.log("baseUrl",req.baseUrl);
  const planId = req.baseUrl.split('/')[2];
  // console.log("planId",planId);
  const planDetails = await ServiceSchema.findOne({ _id: planId,isDelete:false }).sort({ _id: -1 });
  // console.log("planDetails",planDetails);
  const providerinfo = await UserSchema.findById({_id:planDetails.providerId}).exec();
  // console.log("providerinfo",providerinfo);
  let providerName = providerinfo.firstName + ' '+providerinfo.lastName;
    let providerPic = providerinfo.profilePic;
    let providerBio = providerinfo.bio;
    let providerAddress = providerinfo.address;
    let providerwpLink = providerinfo.wpLink;
    let planObj ={
      id:planDetails._id,
      providerId:planDetails.providerId,
      providerName:providerName,
      providerPic:providerPic,
      providerBio:providerBio,
      providerAddress:providerAddress,
      providerwpLink:providerwpLink,
      serviceType:planDetails.serviceType,
      serviceName:planDetails.serviceName,
      description:planDetails.description,
      numOfVisitors:planDetails.numOfVisitors,
      fromDate:planDetails.fromDate,
      toDate:planDetails.toDate,
      price:planDetails.price,
      images:planDetails.images,
      activities:planDetails.activities
    }
    console.log("planObj",planObj);
  console.log("isLoogedInuserLogSee--->",req.session.user);
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/plan-details-services', { title: 'Darkom | Details' ,loggedIn:false,data:planObj})
  } else {
    res.render('pages/plan-details-services', { title: 'Darkom | Details' ,loggedIn:true,data:planObj})
  }
});

module.exports = router;