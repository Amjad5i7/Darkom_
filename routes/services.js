var express = require('express');
var router = express.Router();
var ServiceSchema = require('../schema/api/services');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('pages/services', { title: 'Darkom | Services',loggedIn:true })
// });
router.get('/',async function(req, res, next) {
  console.log("isLoogedInServicesLogSee--->",req.session.user);
 
  if (req.session.user == undefined ) {
    res.render('pages/services', { title: 'Darkom | Services',loggedIn:false,data:{user_type:'user'} ,services:[]})
  } else {
    const servicesActivityList = await ServiceSchema.find({ providerId: req.session.user._id,isDelete:false }).sort({ _id: -1 });
    console.log("servicesActivityList",servicesActivityList)
    res.render('pages/services', { title: 'Darkom | Services',loggedIn:true,data:req.session.user,services: servicesActivityList})
  }
 
});
module.exports = router;
