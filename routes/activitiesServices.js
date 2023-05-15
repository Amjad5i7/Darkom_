var express = require('express');
var router = express.Router();
var {getAllActivityDetails} = require('../services/apiService')
var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/activities-services', { title: 'Darkom | Activities' ,loggedIn:true})
// });
router.get('/',async function(req, res, next) {
  console.log("isLoogedInActivityServicesLogSee--->",req.session.user);
  const servicesActivityList = await ServiceSchema.find({ serviceType: "activity",isDelete:false }).sort({ _id: -1 });
  let activityList=[];
  for (const singleServices of servicesActivityList) {
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
  console.log("activityList",activityList)
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/activities-services', { title: 'Darkom | Activities' ,loggedIn:false,data:activityList})
  } else {
    res.render('pages/activities-services', { title: 'Darkom | Activities' ,loggedIn:true,data:activityList})
  }
});
// router.get('/', checkNotAuthenticated,function(req, res, next) {
  
// });




module.exports = router;