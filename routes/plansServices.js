var express = require('express');
var router = express.Router();
var ServiceSchema = require('../schema/api/services');
var UserSchema = require('../schema/api/users');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/plans-services', { title: 'Darkom | Plans' ,loggedIn:true})
// });
router.get('/',async function(req, res, next) {
  console.log("isLoogedInuserLogSee--->",req.session.user);
  const servicesPlanList = await ServiceSchema.find({ serviceType: "plan",isDelete:false }).sort({ _id: -1 });
  let planList=[];
  for (const singlePlan of servicesPlanList) {
    const providerinfo = await UserSchema.findById({_id:singlePlan.providerId}).exec();
    let providerName = providerinfo.firstName + ' '+providerinfo.lastName;
    let providerPic = providerinfo.profilePic;
    let planObj ={
      id:singlePlan._id,
      providerId:singlePlan.providerId,
      providerName:providerName,
      providerPic:providerPic,
      serviceType:singlePlan.serviceType,
      serviceName:singlePlan.serviceName,
      description:singlePlan.description,
      numOfVisitors:singlePlan.numOfVisitors,
      fromDate:singlePlan.fromDate,
      toDate:singlePlan.toDate,
      price:singlePlan.price,
      images:singlePlan.images,
      activities:singlePlan.activities
    }
    planList.push(planObj);
  }
  console.log("planList",planList)
  if (req.session.user == undefined || req.session.user == {}) {
    res.render('pages/plans-services', { title: 'Darkom | Plans' ,loggedIn:false,data:planList})
  } else {
    res.render('pages/plans-services', { title: 'Darkom | Plans' ,loggedIn:true,data:planList})
  }
});

module.exports = router;