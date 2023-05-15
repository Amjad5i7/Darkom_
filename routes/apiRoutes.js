'use strict';
var express = require('express');
var apiService = require('../services/apiService');
var api = express.Router();
const jwtvalidation = require('../middleware/auth.middleware')
// const {allowIfLoggedin} = require('../../middleware/auth.middleware.js');
var bodyParser = require('body-parser');
const upload = require('../middleware/uploadServiceImages');
const { ensureAuthenticated, forwardAuthenticated } = require('../passport-auth');
const passport = require('passport');
const uploadPic = require('../middleware/uploadUserImage');
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({
    extended: false
}));

/* GET default listing. */
api.get('/', function (req, res, next) {
    res.send('respond with a get method')
  })

/* Register API */
api.post('/registration', apiService.registration);

/* Login API */
api.post('/login',forwardAuthenticated, apiService.login);

/* Reset Password email send API */
//api.post('/resetPassword', apiService.resetPasswordEmailSend);

/* Reset Password  API */
//api.post('/changePassword', apiService.changePassword);

/* User Profile details API */
api.post('/getUser', apiService.getUser);

/* User edit Profile details API */
api.post('/editUserProfile', uploadPic.fields([{name:'profilePic',maxCount:1}]),  apiService.editUserProfile);

/* Add service plan or activity API */
api.post('/addServices',  upload.fields([{name:'planImages',maxCount:1},{name:'activityImages',maxCount:1}]),  apiService.servicesAddPlan);

/* Get Service of plan or activity details by user id */
api.post('/getServiceList', apiService.getServiceList);

/* Get Service activity details last 4 data */
api.post('/getFourActivities', apiService.getFourActivities);

/* view activity details data */
api.post('/viewActivitydetails', apiService.viewActivitydetails);

/* view plan details data */
api.post('/viewPlandetails', apiService.viewPlandetails);

/* view service provider details data */
api.post('/viewServiceProviderProfile', apiService.viewServiceProviderProfile);

/* save payment information data */
api.post('/makeReservation', apiService.makeReservation);

/* save payment information data */
api.post('/addPaymentData', apiService.addPaymentData);
api.post('/getAllActivityDetails', apiService.getAllActivityDetails);
api.post('/deleteServicesPlanOrActivity', apiService.deleteServicesPlanOrActivity);
api.post('/successPaymentsendmail', apiService.successPaymentsendmail);
api.post('/testPayment', apiService.testPayment);
api.post('/forgotPasswordEmail', apiService.forgotPasswordEmail);
api.post('/forgotPasswordReset', apiService.forgotPasswordReset);
api.post('/addAccountDetails', apiService.addAccountDetails);

module.exports = api;
