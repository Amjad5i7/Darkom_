'use strict';
var config = require('../config');
var mongo = require('mongodb');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var UserSchema = require('../schema/api/users');
var PaymentSchema = require('../schema/api/payment');
var ServiceSchema = require('../schema/api/services');
var ReservationSchema = require('../schema/api/reservation');
const bcrypt = require("bcrypt");
var async = require("async");
var ApiModels = require('../models/api/apiModel');
var ObjectId = require("mongodb").ObjectId;
const nodemailer = require("nodemailer");
const passport = require('passport');
const stripe = require('stripe')(config.secretKey);
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        // user: 'sportscloud.athletics@gmail.com',
        // pass: 'gbprevksazhqbkpy',
        user: 'darkomtourism@gmail.com',
        pass: 'qicnacwteajgyuio',
    },
});
// qicnacwteajgyuio
// darkomtourism@gmail.com

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}


// User Signup  *************
module.exports.registration = async (req, res, next) => {
    try {

        if (req.body) {
            const {
                user_type,
                firstName,
                lastName,
                email,
                phoneNumber,
                dob,
                address,
                national_id,
                password,
                confirm_password,
            } = req.body;
            const strongPass = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
            const hashedPassword = await hashPassword(password);
            // Check email format
            const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!mailformat.test(email)) {
                res.json({ success: false, type: "Validation error", message: "Please required a valid email format." });
            }
            // Check the first name only letters
            const checkFirstNa = /^[a-zA-Z ]+$/;
            if (!checkFirstNa.test(firstName)) {
                res.json({
                    success: false,
                    type: "Validation error",
                    message: "First Name can contains only letters.",
                });
            }
            // Check the first name only letters
            const checkLastNa = /^[a-zA-Z ]+$/;
            if (!checkLastNa.test(lastName)) {
                res.json({
                    success: false,
                    type: "Validation error",
                    message: "Last Name can contains only letters.",
                });
            }
            // Check the phone number only numbers
            const checkNumber = /^[0-9]+$/;
            if (!checkNumber.test(phoneNumber)) {
                res.json({
                    success: false,
                    type: "Validation error",
                    message: "Phone number cannot contains only letters.",
                });
            }
            if (!user_type || user_type == '' || user_type == null || user_type == undefined) {
                res.json({ success: false, type: "Validation error", message: "User type is required." });
            } else if (!firstName || firstName == '' || firstName == null || firstName == undefined) {
                res.json({ success: false, type: "Validation error", message: "First Name is required." });
            } else if (!lastName || lastName == '' || lastName == null || lastName == undefined) {
                res.json({ success: false, type: "Validation error", message: "Last Name is required." });
            } else if (!email || email == '' || email == null || email == undefined) {
                res.json({ success: false, type: "Validation error", message: "Email is required." });
            } else if (!password || password == '' || password == null || password == undefined) {
                res.json({ success: false, type: "Validation error", message: "password is required." });
            } else if (password.trim().length < 6 || password.trim().length > 15) {
                res.json({
                    success: false,
                    type: "Validation error",
                    message: "Password length must be 6 - 15 character.",
                });
            } else if (!strongPass.test(password)) {
                res.json({ success: false, type: "Validation error", message: "Passwords must contain at least one Number, one Small and one Capital letter.  Please try again", });
            } else if (!phoneNumber || phoneNumber == '' || phoneNumber == null || phoneNumber == undefined) {
                res.json({ success: false, type: "Validation error", message: "Phone Number is required." });
            } else if (!dob || dob == '' || dob == null || dob == undefined) {
                res.json({ success: false, type: "Validation error", message: "DOB is required." });
            } else if (!confirm_password || confirm_password == '' || confirm_password == null || confirm_password == undefined) {
                res.json({ success: false, type: "Validation error", message: "Confirm password is required." });
            } else if (password != confirm_password) {
                res.json({ success: false, type: "Validation error", message: "Password and Confirm password should be same." });
            } else {
                const emailCheck = await UserSchema.findOne({ email: email });
                const phoneCheck = await UserSchema.findOne({ phoneNumber: phoneNumber });
                if (emailCheck) {
                    res.json({ success: false, type: "Validation error", message: "Email already exists" });
                } else if (phoneCheck) {
                    res.json({ success: false, type: "Validation error", message: "Phone number already exists" });
                } else {
                    const newUser = new UserSchema({
                        user_type: user_type,
                        email: email,
                        password: hashedPassword,
                        phoneNumber: phoneNumber,
                        firstName: firstName,
                        lastName: lastName,
                        address: address,
                        dob: dob,
                        national_id: national_id,
                    });
                    const accessToken = jwt.sign({ userId: newUser._id }, "vaseemm-scret-key", { expiresIn: "30d", });
                    newUser.accessToken = accessToken;
                    await newUser.save();
                    res.json({
                        success: true,
                        message: "Signup successfully..",
                        response_data: newUser,
                    });
                }
            }
        } else {
            return res.json({ success: false, message: "Something wrong with details", response_data: {}, });
        }
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, message: "Something wrong with request.", response_data: err, })
    }

};

module.exports.login = async (req, res, next) => {
    try {
        const { email, password, user_type } = req.body;
        if (!user_type || user_type == '' || user_type == null || user_type == undefined) {
            res.json({ success: false, type: "Validation error", message: "User type is required." });
        }
        if (!email || email == '' || email == null || email == undefined) {
            res.json({ success: false, type: "Validation error", message: "Email is required." });
        }
        if (!password || password == '' || password == null || password == undefined) {
            res.json({ success: false, type: "Validation error", message: "Password is required." });
        }
        const user = await UserSchema.findOne({ email });
        console.log("user", user.user_type)
        if (!user) return next(res.send({
            success: false,
            message: 'Email does not exist',
            response_data: {}
        }));
        if (user.isDelete == true) return next(res.send({
            success: false,
            message: 'Your account has been deleted',
            response_data: {}
        }));
        if (user.user_type != user_type) return next(res.send({
            success: false,
            message: 'Please Provide a valid user type',
            response_data: {}
        }));
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return next(res.send({
            success: false,
            message: 'Password is not correct',
            response_data: {}
        }));
        const accessToken = jwt.sign({ userId: user._id }, "vaseemm-scret-key", {
            expiresIn: "30d"
        });
        await UserSchema.findByIdAndUpdate(user._id, { accessToken })
        // req.session.user = { _id: user._id, email: user?.email, dob: user?.dob, address: user?.address, user_type: user?.user_type, accessToken: accessToken, firstName: user?.firstName, lastName: user?.lastName, phoneNumber: user.phoneNumber, national_id: user.national_id, isDelete: user?.isDelete };
        req.session.user = user;
        // req.session.save();
        res.json({
            success: true,
            message: "Login successfully.",
            response_data: { _id: user._id, email: user?.email, dob: user?.dob, address: user?.address, user_type: user?.user_type, accessToken: accessToken, firstName: user?.firstName, lastName: user?.lastName, phoneNumber: user.phoneNumber, national_id: user.national_id, isDelete: user?.isDelete },
        })
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, message: "Something wrong with request.", response_data: err, })
    }

};

module.exports.resetPasswordEmailSend = async (req, res, next) => {
    try {
        const emailData = req.body.email;
        if (!emailData || emailData == '' || emailData == null || emailData == undefined) {
            res.json({ success: false, type: "Validation error", message: "Email is required." });
        }
        const sendUserData = await User.findOne(
            { email: emailData },
            "_id firstName phone lastName email"
        );
        if (sendUserData) {
            //Email Verification
            let currYear = moment().format("YYYY");
            var name = sendUserData.firstName + " " + sendUserData.lastName;
            /* One link here                      */
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            let mailOptions = {
                from: "sportscloud.athletics@gmail.com",
                to: sendUserData.email,
                subject: "Change Password Email sent",
                html:
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="70%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img style="height:100px" src="" alt="Darkom Tourism Logo" title="" border=0;/></td></tr><tr><td valign="top" style="padding: 40px; text-align: center" height="200">Hello ' +
                    name +
                    ",Your darkom tourism app change password email link:<B> " +
                    otp +
                    '</B> </td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;">Copyright @' +
                    currYear +
                    " Darkom Tourism All rights reserved..</p></td></tr></table></td></tr></table></body></html>",
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Mail resent: " + info.response);
                }
            });

            UserSchema.updateOne(
                { _id: sendUserData._id },
                { emailSend: otp }
            )
                .then((updateuser) => {
                    return res.json({
                        success: true,
                        message: "otp sent successfully.",
                        response_data: updateuser,
                    });
                })
                .catch((e) => {
                    return res.json({
                        success: false,
                        message: "update request for change password successfully.",
                        response_data: {},
                    });
                });
        } else {
            return res.json({
                success: false,
                message: "user email does not exist",
                response_data: {},
            });
        }
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, message: "Something wrong with request.", response_data: err, })
    }
};

module.exports.changePassword = async (req, res, next) => {
    try {
        const emailData = req.body.email;
        if (!emailData || emailData == '' || emailData == null || emailData == undefined) {
            res.json({ success: false, type: "Validation error", message: "Email is required." });
        }
        const sendUserData = await UserSchema.findOne(
            { email: emailData },
            "_id firstName phone lastName email"
        );
        if (sendUserData) {
            const strongPass = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

            //Email Verification
            const newPasswordData = req.body.newPassword;
            const confirmNewPasswordData = req.body.confirmNewPassword;
            if (!newPasswordData || newPasswordData == '' || newPasswordData == null || newPasswordData == undefined) {
                res.json({ success: false, type: "Validation error", message: "New Password is required." });
            }
            if (newPasswordData.trim().length < 8 || newPasswordData.trim().length > 15) {
                res.json({ success: false, type: "Validation error", message: "Password length must be 7 - 15 character.", });
            }
            if (!strongPass.test(newPasswordData)) {
                res.json({ success: false, type: "Validation error", message: "New Password must contain at least one Number, one Small and one Capital letter ! Please try again.", });
            }
            if (!confirmNewPasswordData || confirmNewPasswordData == '' || confirmNewPasswordData == null || confirmNewPasswordData == undefined) {
                res.json({ success: false, type: "Validation error", message: "Confirm Password is required." });
            }
            if (newPasswordData != confirmNewPasswordData) {
                res.json({ success: false, type: "Validation error", message: "New Password and Confirm password should be same." });
            }

            const hashedPassword = await hashPassword(newPasswordData);


            UserSchema.updateOne(
                { _id: sendUserData._id },
                { password: hashedPassword }
            )
                .then((updateUser) => {
                    return res.json({
                        success: true,
                        message: "Reset password done successfully.",
                        response_data: updateUser,
                    });
                })
                .catch((e) => {
                    return res.json({
                        success: false,
                        message: "INTERNAL DB ERROR.",
                        response_data: { e },
                    });
                });
        } else {
            return res.json({
                success: false,
                message: "user email does not exist",
                response_data: {},
            });
        }
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, message: "Something wrong with request.", response_data: err, })
    }
};


module.exports.getUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!ObjectId.isValid(userId)) return res.json({ success: false, message: "Invalid id" })
        const user = await UserSchema.findOne({ _id: userId });
        if (!user)
            res.send('User not found');
        // else {
        //     console.log("user",user)
        //     return res.json({ success: true, message: "Get user details.", response_data: user, })
        // }

        res.render('pages/servieceproviderprofile', {
            title: 'Darkom | Profile',
            data: user
        })
    } catch (error) {
        console.log("something went wrong");
        res.send("something went wrong");
    }
};

module.exports.editUserProfile = async (req, res, next) => {
    try {
        const userId = req.body.id;
        var uploadFiles = req.files;
        console.log("uploadFiles===========", uploadFiles);
        const userData = await UserSchema.findById(userId);
        console.log("userData===========", userData);
        var obj = {};
        
        if (req.body.fullName) {
            const fullName = req.body.fullName;
            obj.firstName = fullName.split(" ")[0]
            obj.lastName = fullName.split(" ")[1]
        }
        if (req.body.phoneNumber) {
            obj.phoneNumber = req.body.phoneNumber
        }
        if (req.body.dob) {
            obj.dob = req.body.dob
        }
        if (req.body.address) {
            obj.address = req.body.address
        }
        if (req.body.national_id) {
            obj.national_id = req.body.national_id
        }
        if (req.body.wpLink) {
            obj.wpLink = req.body.wpLink
        }
        if (req.body.bio) {
            obj.bio = req.body.bio
        }
        if (uploadFiles.profilePic) {
            const ProfilePic = uploadFiles.profilePic
                ? uploadFiles.profilePic.length > 0
                    ? config.localhost +
                    "/user_profile_pic/" +
                    uploadFiles.profilePic[0].filename
                    : ""
                : false;
            obj.profilePic = ProfilePic
        }
        console.log("req.body.==========    ", req.body);

        const updateData = await UserSchema.findByIdAndUpdate(userId, obj, {
            new: true
        });
        const getUserData = await UserSchema.findById(userId);
        res.json({
            success: true,
            message: "User profile updated successfully..",
            response_data: getUserData,
        })
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: `Could not upload the file`,
        });
    }
}

module.exports.servicesAddPlan = async (req, res, next) => {
    const serviceFile = req.files;
    const postData = req.body;
    let errors = {
        success: false,
        message: "",
    };
    try {
        if (postData.providerId == "") {
            errors.message = "Provider Id is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.serviceType == "") {
            errors.message = "Service type is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.serviceName == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.description == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.numOfVisitors == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.fromDate == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.toDate == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.price == "") {
            errors.message = "Service name is required";
            res.status(200).json(errors);
            return;
        }
        const planImage = serviceFile.planImages
            ? serviceFile.planImages.length > 0
                ? config.localhost +
                "/service-files/" +
                serviceFile.planImages[0].filename
                : false
            : false;
        const activityImage = serviceFile.activityImages
            ? serviceFile.activityImages.length > 0
                ? config.localhost +
                "/service-files/" +
                serviceFile.activityImages[0].filename
                : false
            : false;
        const userIdCheck = await UserSchema.findOne({ _id: postData.providerId });
        if (!userIdCheck) {
            return res.json({ success: false, message: "Please provide a valid provider id", })
        }
        const userCheck = await UserSchema.findOne({ _id: postData.providerId }, 'user_type');
        if (userCheck.user_type != "service_provider") {
            return res.json({ success: false, message: "You are not allowed to create services.", })
        } else if (userCheck.user_type == "service_provider") {
            if (postData.serviceType == "plan") {
                
                const newServices = new ServiceSchema({
                    providerId: postData.providerId,
                    serviceType: postData.serviceType,
                    serviceName: postData.serviceName,
                    description: postData.description,
                    numOfVisitors: postData.numOfVisitors,
                    fromDate: postData.fromDate,
                    toDate: postData.toDate,
                    price: postData.price,
                    images: planImage,
                    activities: postData.activities,
                })
                newServices.save();
                res.json({
                    success: true,
                    message: "Plan added successfully..",
                    response_data: newServices,
                });
            } else if (postData.serviceType == "activity") {
                const newServices = new ServiceSchema({
                    providerId: postData.providerId,
                    serviceType: postData.serviceType,
                    serviceName: postData.serviceName,
                    description: postData.description,
                    numOfVisitors: postData.numOfVisitors,
                    fromDate: postData.fromDate,
                    toDate: postData.toDate,
                    price: postData.price,
                    images: activityImage,
                })
                newServices.save();
                // req.flash('successActivityAdded', 'Activity added successfully..')
                // res.render('pages/add-activities', { messages: req.flash('successActivityAdded'),  response_data: newServices, title: 'Darkom | Add Activity', errors: '' });
                res.json({
                    success: true,
                    message: "Activity added successfully..",
                    response_data: newServices,
                });
            } else {
                res.json({
                    success: false,
                    message: "Service Type should be plan or activity ..",
                });
            }

        } else {
            errors.message = "Error in add new service data.";
            res.status(200).json(errors);
            return;
        }
    } catch (e) {
        console.log("e", e)
        errors.message = e.message;
        res.status(200).json(errors);
        return;
    }
};

module.exports.getServiceList = async (req, res, next) => {
    let errors = {
        success: false,
        message: "",
    };
    try {
        const userId = req.body.Id;

        if (!userId || userId == '' || userId == null || userId == undefined) {
            res.json({ success: false, type: "Validation error", message: "User Id is required." });
        }
        if (!ObjectId.isValid(userId)) return res.json({ success: false, message: "Invalid id" })
        const user = await UserSchema.findById(userId);
        if (!user) {
            res.json({
                success: false,
                message: "User does not exists ..",
            });
        }

        const getData = await ServiceSchema.find({ providerId: userId });
        if (getData) {
            res.status(200).json({
                success: true,
                message: "Fetch User service details successfully..",
                response_data: getData,
            });
        } else {
            res.json({
                success: false,
                message: "No data found..",
            });
        }
    } catch (error) {
        console.log("e", error)
        errors.message = error.message;
        res.status(200).json(errors);
        return;
    }
};

module.exports.getFourActivities = async (req, res) => {
    try {
        const serviceOfActivity = await ServiceSchema.find({ serviceType: "activity" }).sort({ _id: -1 }).limit(4);
        if (!serviceOfActivity) {
            return res.json({ success: false, message: "INTERNAL DB ERROR.", response_data: {}, })
        }
        else {
            return res.json({ success: true, message: "Get activity details.", response_data: serviceOfActivity, })
        }

        res.render('pages/servieceproviderprofile', {
            title: 'Darkom | Profile',
            data: user
        })
    } catch (error) {
        console.log("something went wrong");
        res.send("something went wrong");
    }
};

module.exports.viewActivitydetails = async (req, res) => {
    try {
        const activityDetailsId = req.body.activityId;
        if (!activityDetailsId || activityDetailsId == '' || activityDetailsId == null || activityDetailsId == undefined) {
            res.json({ success: false, type: "Validation error", message: "Activity Id is required." });
        }
        if (!ObjectId.isValid(activityDetailsId)) return res.json({ success: false, message: "Invalid id" })
        const activityCheck = await ServiceSchema.findOne({ _id: activityDetailsId }, 'serviceType');
        if (activityCheck.serviceType != "activity") {
            return res.json({ success: false, message: "Please provide a valid activity id.", response_data: {}, })
        } else if (!activityCheck) {
            return res.json({ success: false, message: "No data found.", response_data: {}, })
        } else {
            return res.json({ success: true, message: "view activity details.", response_data: activityCheck, })
        }

        res.render('pages/servieceproviderprofile', {
            title: 'Darkom | Profile',
            data: user
        })
    } catch (error) {
        console.log("something went wrong");
        res.send({ success: false, message: "INTERNAL DB ERROR.", });
    }
};

module.exports.viewPlandetails = async (req, res) => {
    try {
        const planDetailsId = req.body.planId;
        if (!planDetailsId || planDetailsId == '' || planDetailsId == null || planDetailsId == undefined) {
            res.json({ success: false, type: "Validation error", message: "Plan Id is required." });
        }
        if (!ObjectId.isValid(planDetailsId)) return res.json({ success: false, message: "Invalid id" })
        const planCheck = await ServiceSchema.findOne({ _id: planDetailsId }, 'serviceType providerId serviceName description numOfVisitors fromDate toDate price images activities');
        const userName = await UserSchema.findOne({ _id: planCheck.providerId }, 'firstName lastName email');
        const obj = {
            _id: planCheck._id,
            providerId: planCheck?.providerId,
            providerEmail: userName ? userName?.email : "",
            providerName: userName ? userName?.firstName + " " + userName?.lastName : "",
            serviceType: planCheck?.serviceType ? planCheck?.serviceType : "",
            serviceName: planCheck?.serviceName ? planCheck?.serviceName : "",
            description: planCheck?.description ? planCheck?.description : "",
            numOfVisitors: planCheck?.numOfVisitors ? planCheck?.numOfVisitors : 0,
            fromDate: planCheck?.fromDate ? planCheck?.fromDate : "",
            toDate: planCheck?.toDate ? planCheck?.toDate : "",
            price: planCheck?.price ? planCheck?.price : 0,
            images: planCheck?.images ? planCheck?.images : "",
            activities: planCheck?.activities ? planCheck?.activities : [],
            isDelete: planCheck?.isDelete ? planCheck?.isDelete : false,
        }
        if (planCheck.serviceType != "plan") {
            return res.json({ success: false, message: "Please provide a valid plan id.", response_data: {}, })
        } else if (!planCheck) {
            return res.json({ success: false, message: "No data found.", response_data: {}, })
        } else {
            return res.json({ success: true, message: "view plan details.", response_data: obj, })
        }
        // res.render('pages/servieceproviderprofile', {
        //     title: 'Darkom | Profile',
        //     data: user
        // })
    } catch (error) {
        console.log("something went wrong");
        res.send({ success: false, message: "INTERNAL DB ERROR.", });
    }
};

module.exports.viewServiceProviderProfile = async (req, res) => {
    try {
        const serviceProviderId = req.body.providerId;
        if (!serviceProviderId || serviceProviderId == '' || serviceProviderId == null || serviceProviderId == undefined) {
            res.json({ success: false, type: "Validation error", message: "Service Provider Id is required." });
        }
        if (!ObjectId.isValid(serviceProviderId)) return res.json({ success: false, message: "Invalid id" })

        const userCheck = await UserSchema.findOne({ _id: serviceProviderId }, { firstName: 1, lastName: 1, email: 1, user_type: 1, phoneNumber: 1, dob: 1, address: 1, national_id: 1, isDelete: 1, });
        console.log("userCheck", userCheck)
        const obj = {
            _id: userCheck?._id,
            user_type: userCheck?.user_type ? userCheck?.user_type : "",
            email: userCheck?.email ? userCheck?.email : "",
            fullName: userCheck ? userCheck?.firstName + " " + userCheck?.lastName : "",
            lastName: userCheck?.lastName ? userCheck?.lastName : "",
            phoneNumber: userCheck?.phoneNumber ? userCheck?.phoneNumber : "",
            dob: userCheck?.dob ? userCheck?.dob : "",
            address: userCheck?.address ? userCheck?.address : "",
            national_id: userCheck?.national_id ? userCheck?.national_id : "",
            isDelete: userCheck?.isDelete ? userCheck?.isDelete : false,
        }
        if (userCheck.user_type != "service_provider") {
            return res.json({ success: false, message: "Please provide a valid provider id.", response_data: {}, })
        } else if (!userCheck) {
            return res.json({ success: false, message: "No data found.", response_data: {}, })
        } else {
            return res.json({ success: true, message: "view service provider details.", response_data: obj, })
        }
        // res.render('pages/servieceproviderprofile', {
        //     title: 'Darkom | Profile',
        //     data: user
        // })
    } catch (error) {
        console.log("something went wrong");
        res.send({ success: false, message: "INTERNAL DB ERROR.", });
    }
};

module.exports.addPaymentData = async (req, res, next) => {
    const postData = req.body;
    let errors = {
        success: false,
        message: "",
    };
    try {
        if (postData.userId == "") {
            errors.message = "User Id is required";
            res.status(200).json(errors);
            return;
        }

        if (postData.accountOwnerName == "") {
            errors.message = "Account Owner name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.accountNumberOrIBAN == "") {
            errors.message = "Account number or IBAN is required";
            res.status(200).json(errors);
            return;
        }
        const userIdCheck = await UserSchema.findOne({ _id: postData.userId })
        if (!userIdCheck) {
            return res.json({ success: false, message: "No data found! Please provide a valid id", response_data: {}, })
        }

        const newPaymentData = new PaymentSchema({
            userId: postData.userId,
            accountOwnerName: postData.accountOwnerName,
            accountNumberOrIBAN: postData.accountNumberOrIBAN
        })
        newPaymentData.save();

        // req.flash('successReservationAdded', 'Reservation added successfully..')
        // res.render('add-plan', { messages: req.flash('successReservationAdded'), response_data: newReservation });

        res.json({
            success: true,
            message: "Payment data added successfully..",
            response_data: newPaymentData,
        });

    } catch (e) {
        console.log("e", e)
        errors.message = e.message;
        res.status(200).json(errors);
        return;
    }
};
// var apiService = {

//     //register User
//     register: (data, callback) => {
//         var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//         if (!data.firstName || typeof data.firstName === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide firstName",
//                 response: []
//             });
//         } else if (!data.lastName || typeof data.lastName === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide lastName",
//                 response: []
//             });
//         } else if ((!data.national_id || typeof data.national_id === undefined) && data.user_type === "service-provider") {
//             callback({

//                 response_code: 404,
//                 message: "please provide national id",
//                 response: []
//             });
//         } else if (!data.phoneNumber || typeof data.phoneNumber === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide phoneNumber",
//                 response: []
//             });
//         } else if (!data.email || typeof data.email === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide email",
//                 response: []
//             });
//         } else if (!re.test(String(data.email).toLowerCase())) {
//             callback({
//                 "response_code": 404,
//                 "message": "please provide valid email address",
//                 "response": {}
//             });
//         } else if (!data.password || typeof data.password === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide password",
//                 response: []
//             });
//         } else if (!data.confirm_password || typeof data.confirm_password === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide confirm password",
//                 response: []
//             });
//         } else if (data.confirm_password !== data.password) {
//             callback({

//                 response_code: 404,
//                 message: "Confirm password doesn't match",
//                 response: []
//             });
//         } else {

//             data._id = new ObjectID;
//             data.email = String(data.email).toLowerCase();

//             ApiModels.register(data, function (result) {
//                 callback(result);
//             });
//         }
//         console.log("register");
//     },

//     //login
//     login: (data, callback) => {
//         if (!data.email || typeof data.email === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide email address",
//                 response: []
//             });
//         } else if (!data.password || typeof data.password === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide password",
//                 response: []
//             });
//         } else if (!data.deviceToken || typeof data.deviceToken === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide deviceToken",
//                 response: []
//             });
//         } else if (!data.appType || typeof data.appType === undefined) {
//             callback({

//                 response_code: 404,
//                 message: "please provide appType",
//                 response: []
//             });
//         } else {
//             ApiModels.login(data, function (result) {
//                 callback(result);
//             });
//         }
//     },
// }
// module.exports = apiService;
module.exports.getFourActivitiesHome = async (req, res) => {
    try {
        console.log("userLogSee--->",req.session.user);
        const serviceOfActivity = await ServiceSchema.find({ serviceType: "activity" }).sort({ _id: -1 }).limit(4);
        if (!serviceOfActivity) {
            return res.json({ success: false, message: "INTERNAL DB ERROR.", response_data: {}, })
        }
        res.render('pages/home', { url: 'pageone', title: 'Darkom | Home Page', baseUrl: req.baseUrl, homeActivity: serviceOfActivity})
        
    } catch (error) {
        console.log("something went wrong");
        res.send("something went wrong");
    }
};
module.exports.getAllPlanDetails = async (req, res, next) => {
    let errors = {
        success: false,
        message: "",
    };
    try {
            let getList = [];
            const serviceOfPlan = await ServiceSchema.find({ serviceType: "plan" }).sort({ _id: -1 });

            for (const providersPlan of serviceOfPlan) {
                const userInfo = await this.getUserById(providersPlan.providerId);
                const getObj = {
                    planId: providersPlan?._id,
                    providerName: providersPlan ? userInfo?.firstName + " " + userInfo.lastName : "",
                    providerImage: providersPlan ? userInfo?.profilePic : "",
                    providerId: providersPlan?.providerId ? providersPlan?.providerId : "",
                    serviceType: providersPlan?.serviceType ? providersPlan?.serviceType : "",
                    serviceName: providersPlan?.serviceName ? providersPlan?.serviceName : "",
                    description: providersPlan?.description ? providersPlan?.description : "",
                    numOfVisitors: providersPlan?.numOfVisitors ? providersPlan?.numOfVisitors : 0,
                    fromDate: providersPlan?.fromDate ? providersPlan?.fromDate : "",
                    toDate: providersPlan?.toDate ? providersPlan?.toDate : "",
                    price: providersPlan?.price ? providersPlan?.price : 0,
                    images: providersPlan?.images ? providersPlan?.images : "",
                    activities: providersPlan?.activities ? providersPlan?.activities : [],
                    isDelete: providersPlan?.isDelete ? providersPlan?.isDelete : false,
                };
                getList.push(getObj);
            }
            if (getList.length > 0) {
                return res.send({ status: true, message: "Fetch all plan List", response_data: getList });
            } else {
                res.send({ status: false, message: "No Data Found" });
                return;
            }
    } catch (error) {
        console.log("e", error)
        errors.message = error.message;
        res.status(200).json(errors);
        return;
    }
};
exports.getUserById = (_id) => {
    let query = { _id };
    return UserSchema.findById(query).exec();
};

module.exports.getAllActivityDetails = async (req, res, next) => {
    let errors = {
        success: false,
        message: "",
    };
    try {
            let getList = [];
            const serviceOfPlan = await ServiceSchema.find({ serviceType: "activity" }).sort({ _id: -1 });

            for (const providersPlan of serviceOfPlan) {
                const userInfo = await this.getUserById(providersPlan.providerId);
                const getObj = {
                    planId: providersPlan?._id,
                    providerName: providersPlan ? userInfo?.firstName + " " + userInfo.lastName : "",
                    providerImage: providersPlan ? userInfo?.profilePic : "",
                    providerId: providersPlan?.providerId ? providersPlan?.providerId : "",
                    serviceType: providersPlan?.serviceType ? providersPlan?.serviceType : "",
                    serviceName: providersPlan?.serviceName ? providersPlan?.serviceName : "",
                    description: providersPlan?.description ? providersPlan?.description : "",
                    numOfVisitors: providersPlan?.numOfVisitors ? providersPlan?.numOfVisitors : 0,
                    fromDate: providersPlan?.fromDate ? providersPlan?.fromDate : "",
                    toDate: providersPlan?.toDate ? providersPlan?.toDate : "",
                    price: providersPlan?.price ? providersPlan?.price : 0,
                    images: providersPlan?.images ? providersPlan?.images : "",
                    isDelete: providersPlan?.isDelete ? providersPlan?.isDelete : false,
                };
                getList.push(getObj);
            }
            if (getList.length > 0) {
                return res.send({ status: true, message: "Fetch all activity List", response_data: getList });
            } else {
                res.send({ status: false, message: "No Data Found" });
                return;
            }
    } catch (error) {
        console.log("e", error)
        errors.message = error.message;
        res.status(200).json(errors);
        return;
    }
};
module.exports.deleteServicesPlanOrActivity = async (req, res) => {
    try {
        const serviceId = req.body.serviceId;
        if (!serviceId || serviceId == '' || serviceId == null || serviceId == undefined) {
            res.json({ success: false, type: "Validation error", message: "Service Id is required." });
        }
        if (!ObjectId.isValid(serviceId)) return res.json({ success: false, message: "Invalid id" })

        const isServiceIdCheck = await ServiceSchema.findOne({ _id: serviceId },'isDelete');
        if(!isServiceIdCheck){
            return res.json({ success: false, message: "Please provide a valid service id.", response_data: {}, })
        } else if(isServiceIdCheck.isDelete == true){
            return res.json({ success: false, message: "Your service was already deleted.", response_data: {}, })
        } else {
            const isServiceCheck = await ServiceSchema.updateOne({ _id: serviceId }, { isDelete: true });
            return res.json({ success: true, message: "Service deleted successfully", response_data: isServiceCheck, })
        }
    } catch (error) {
        console.log("something went wrong");
        res.send({ success: false, message: "INTERNAL DB ERROR.", });
    }
};
module.exports.successPaymentsendmail = async (req, res, next) => {
    try {
        const emailData = req.body.email;
        if (!emailData || emailData == '' || emailData == null || emailData == undefined) {
            res.json({ success: false, type: "Validation error", message: "Email is required." });
        }
        //Email Verification
        const sendUserData = await UserSchema.findOne(
            { email: emailData },
            "_id firstName lastName email"
        );
        if (sendUserData) {
            let currYear = moment().format("YYYY");
            var name = sendUserData.firstName + " " + sendUserData.lastName;

            let mailOptions = {
                from: "sportscloud.athletics@gmail.com",
                to: sendUserData.email,
                subject: "Your Reservation Details !!! ",
                html:
                    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body bgcolor="#ededed"><table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ededed" ><tr><td><table width="70%" border="0" cellspacing="0" cellpadding="0" bgcolor="#FFF" align="center" style="border-radius:10px; border:1px solid #ededed; box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.25); margin: auto;"><tr><td valign="top" align="center" style="padding: 15px"><img style="height:100px" src="" alt="Darkom Tourism Logo" title="" border=0;/></td></tr><tr><td valign="top" style="padding: 40px; text-align: center" height="200">Hello ' +
                    name +
                    '",Your Reservation Payment Has Been Successfully Completed." </td></tr><tr><td style="padding: 15px" align="center" bgcolor="#FFF"><p style="font:normal 12px Arial, Helvetica, sans-serif;">Copyright @' +
                    currYear +
                    " Darkom Tourism All rights reserved..</p></td></tr></table></td></tr></table></body></html>",
            };
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Mail resent: " + info.response);
                }
            });

            ReservationSchema.updateOne(
                { _id: sendUserData._id },
                { reservedPaymentMailSend: true }
            )
                .then((updateReserve) => {
                    return res.json({
                        success: true,
                        message: "Email send successfully.",
                        response_data: updateReserve,
                    });
                })
                .catch((e) => {
                    return res.json({
                        success: false,
                        message: "update request mail send successfully.",
                        response_data: {},
                    });
                });
        } else {
            return res.json({
                success: false,
                message: "user email does not exist",
                response_data: {},
            });
        }
    } catch (err) {
        console.log("err", err);
        return res.json({ success: false, message: "Something wrong with requested data.", response_data: err, })
    }
};
module.exports.makeReservation = async (req, res, next) => {
    const postData = req.body;
    let errors = {
        success: false,
        message: "",
    };
    try {
        if (postData.serviceId == "") {
            errors.message = "Service Id is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.visitorId == "") {
            // req.flash('errors', 'Provider Id is required')
            // return res.redirect("/admin/login");
            errors.message = "Visitor Id is required";
            res.status(200).json(errors);
            return;
        }
        if (!ObjectId.isValid(postData.visitorId)) return res.json({ success: false, message: "Invalid id" })
        if (postData.visitorName == "") {
            errors.message = "Visitor name is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.date == "") {
            errors.message = "Date is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.visitorsNo == "") {
            errors.message = "No of visitors is required";
            res.status(200).json(errors);
            return;
        }
        if (postData.details == "") {
            errors.message = "details is required";
            res.status(200).json(errors);
            return;
        }
        // const reqDate = postData.date;
        const userIdCheck = await UserSchema.findOne({ _id: postData.visitorId });
        if (!userIdCheck) {
            return res.json({ success: false, message: "Please provide a valid visitor id", })
        }
        const userCheck = await UserSchema.findOne({ _id: postData.visitorId }, 'user_type');
        if (userCheck.user_type != "visitor") {
            return res.json({ success: false, message: "You are not allowed to make reservation.", })
        } else if (userCheck.user_type == "visitor") {
            const serviceIdCheck = await ServiceSchema.findOne({ _id: postData.serviceId }, 'serviceType numOfVisitors fromDate toDate isDelete')
            if (!serviceIdCheck) {
                return res.json({ success: false, message: "Please provide a valid service id.", })
            } else if (serviceIdCheck.isDelete === true) {
                return res.json({ success: false, message: "You can not make reservation on this service.", })
            } else if (serviceIdCheck) {
                const dateString = postData.date; // Date string in "DD-MM-YYYY" format
                const parts = dateString.split('-'); // Split date string into day, month, and year components

                const year = parseInt(parts[2]); // Convert year string to number
                const month = parseInt(parts[1]) - 1; // Convert month string to zero-based index
                const day = parseInt(parts[0]); // Convert day string to number

                const date = new Date(year, month, day).toISOString(); // Create ISODate string // Output: 2023-05-05T21:00:00.000Z
                console.log("reqDate", date)
                const dateStringg = serviceIdCheck.fromDate; // Date string in "DD-MM-YYYY" format
                const partsp = dateStringg.split('-'); // Split date string into day, month, and year components

                const yr = parseInt(partsp[2]); // Convert year string to number
                const mh = parseInt(partsp[1]) - 1; // Convert month string to zero-based index
                const dy = parseInt(partsp[0]); // Convert day string to number

                const fromDate = new Date(yr, mh, dy).toISOString(); // Create ISODate string // Output: 2023-05-05T21:00:00.000Z
                console.log("fromDate", fromDate)

                const dateStrings = serviceIdCheck.toDate; // Date string in "DD-MM-YYYY" format
                const part = dateStrings.split('-'); // Split date string into day, month, and year components

                const yer = parseInt(part[2]); // Convert year string to number
                const mnt = parseInt(part[1]) - 1; // Convert month string to zero-based index
                const dey = parseInt(part[0]); // Convert day string to number

                const toDate = new Date(yer, mnt, dey).toISOString(); // Create ISODate string // Output: 2023-05-05T21:00:00.000Z
                console.log("toDate", toDate)

                const checkDate = await ServiceSchema.find({
                    dateString: { $gte: dateStringg, $lt: dateStrings },
                    _id: postData.serviceId,
                });
                console.log("checkDate", checkDate)
                if (!checkDate) {
                    return res.json({ success: false, message: "Please provide valid date under services add date.", })
                } else if (postData.visitorsNo <= serviceIdCheck.numOfVisitors) {
                    const newReservation = new ReservationSchema({
                        serviceId: postData.serviceId,
                        visitorId: postData.visitorId,
                        visitorName: postData.visitorName,
                        date: postData.date,
                        visitorsNo: postData.visitorsNo,
                        details: postData.details
                    })
                    newReservation.save();
                    res.json({ success: true, message: "Reservation added successfully..", response_data: newReservation, });
                } else {
                    res.json({ success: false, message: "Value must be less than or equal to maximum visitors on add services.", });
                }
            } else {
                res.json({ success: false, message: "Something went wrong.", });
            }
        } else {
            errors.message = "Error in add reservation data.";
            res.status(200).json(errors);
            return;
        }
    } catch (e) {
        console.log("e", e)
        errors.message = e.message;
        res.status(200).json(errors);
        return;
    }
};
module.exports.testPayment = async (req, res) => {
    console.log('Test Payment=>', req.body);
    try {
        const { paymentMethodId, amount,reservationId,visitorEmail, name,providerId,serviceType,serviceName,address,quantity,details,serviceImage} = req.body;
        let customerName = name;
        let aedAmt = amount+'00';
        let visitorId = req.session.user._id;
        // Create a payment intent






        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: aedAmt,
        //     currency: 'AED',
        //     automatic_payment_methods: { enabled: true },
        //     customer_email: visitorEmail,
        //     customer_name: customerName
        //   });
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: aedAmt,
        //     currency: 'AED',
        //     automatic_payment_methods: { enabled: true },
        //     customer: {
        //       "email": visitorEmail,
        //       "name": customerName
        //     }
        //   });
        // Create a customer
// const customer = await stripe.customers.create({
//     email: visitorEmail,
//     name: customerName
//   });
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: aedAmt,
        //     currency: 'AED',
        //     automatic_payment_methods: { enabled: true },
        //     customer: customer.id
        //   });
        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount:aedAmt,
        //   currency: 'AED',
        //   payment_method: paymentMethodId,
        //   confirm: true,
        // });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: aedAmt,
            currency: 'AED',
            payment_method: paymentMethodId,
            confirm: true
          });
    
        // If the payment is successful
        if (paymentIntent.status === 'succeeded') {
          // Handle the successful payment and update your database
       
        const newReservation = new ReservationSchema({
            visitorId:visitorId,
            visitorName:name,
            visitorEmail:visitorEmail,
            serviceId:reservationId,
            paymentMethodId:paymentMethodId,
            amount:amount,
            providerId:providerId,
            serviceType:serviceType,
            serviceName:serviceName,
            address:address,
            quantity:quantity,
            details:details,
            serviceImage:serviceImage
        })
        newReservation.save();
          // Send a success response to the client
          const mailOptions = {
            from: 'darkomtourism@gmail.com',
            to: 'santu.mondal@brainiuminfotech.com',
            subject: 'Payment Confirmation',
            html: `
              <h1>Payment Confirmation</h1>
              <p>Your payment was successful. Thank you!</p>
              <h2>Payment Details:</h2>
              <p>Amount:AED ${amount}</p>
              <p>Payment Method: ${paymentMethodId}</p>
            `,
          };
    
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.status(200).json({success: true, message: 'Payment successful' });
        } else {
          // Handle payment failure
          res.status(400).json({success: false, message: 'Payment failed' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false,message: 'Internal server error' });
      }
    // stripe.customers.create({
    //     email: req.body.stripeEmail,
    //     source: req.body.stripeToken,
    //     name: 'Gourav Hammad',
    //     address: {
    //         line1: 'TC 9/4 Old MES colony',
    //         postal_code: '452331',
    //         city: 'Indore',
    //         state: 'Madhya Pradesh',
    //         country: 'India',
    //     }
    // })
    // .then((customer) => {
 
    //     return stripe.charges.create({
    //         amount: 2500,     // Charging Rs 25
    //         description: 'Web Development Product',
    //         currency: 'AED',
    //         customer: customer.id
    //     });
    // })
    // .then((charge) => {
    //     res.send("Success")  // If no error occurs
    // })
    // .catch((err) => {
    //     res.send(err)       // If some error occurs
    // });
};

module.exports.forgotPasswordEmail = async (req, res, next) => {
    const {email} = req.body;
    let errors = {
        success: false,
        message: "",
    };
    if (email == "" || email == undefined) {
        errors.message = "email id is required";
        res.status(200).json(errors);
        return;
    }
    const checkUser = await UserSchema.findOne({email:email}).exec();
    if (!checkUser) {
        errors.message = "email id doesn't exist";
        res.status(200).json(errors);
        return;
    }
    const expiringToken = generateExpiringToken();
    const mailOptions = {
        from: 'darkomtourism@gmail.com',
        to: email,
        subject: 'Your Password Reset Request',
        html:`<html>
        <head>
          <style>
            /* Inline CSS styles */
              .heahing{
              }
              .para{
                font-weight: 600;
              }
              .con-body{
                background: #DA9D6F;
                padding: 5%;
              }
              .link{
                display: block;
                width: 115px;
                height: 25px;
                background: #4E9CAF;
                padding: 10px;
                text-align: center;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                line-height: 25px;
              }

        
            /* More CSS styles */
          </style>
            </head>
            <body class="con-body">
            <h1>Hi ${checkUser.firstName +' '+checkUser.lastName}</h1>
            <p >Click the link below to reset your password.(Link valid for 5 mins)</p>
            <a class="link" href="http://127.0.0.1:3112/forgot-password-two/${checkUser._id+'$'+expiringToken}">Link</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p >Your Password won't change until you access the link above and create a new one.</p>
            </body>
            </html>`,
        // html: `
        //       <h1>Hi ${checkUser.firstName +' '+checkUser.lastName}</h1>
        //       <p>Click the link below to reset your password.(Link valid for 5 mins)</p>
        //       <a style="font-family: 'Raleway', sans-serif; font-size:20px; color:#2b3c4d; line-height:24px; font-weight: bold;" href="http://127.0.0.1:3112/forgot-password-two/${checkUser._id+'$'+expiringToken}">Link</a>
        //     `,
        // html: `<p>Click the following link to reset your password (Link valid for 5 mins):</p>
        //        <a href="http://127.0.0.1:3112/forgot-password-two/${checkUser._id+'$'+expiringToken}">Reset Password</a>`
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
      return res.send({ success: true, message: "An email has been sent to your email address. Follow the instruction in the email to reset your password."});
    // console.log("checkUser",checkUser);
};

module.exports.forgotPasswordReset = async (req, res, next) => {
    const {resetId,password,confirm_password} = req.body;
     let userId = resetId.split('$')[0];
  let resetToken = resetId.split('$')[1];
  console.log("userId",userId);
  console.log("resetToken",resetToken);
  const isValid = verifyExpiringToken(resetToken);
  console.log("resetTokenisValid",isValid);

    let errors = {
        success: false,
        message: "",
    };
    if (password == "" || password == undefined) {
        errors.message = "password is required";
        res.status(200).json(errors);
        return;
    }
    if (confirm_password == "" || confirm_password == undefined) {
        errors.message = "confirm password is required";
        res.status(200).json(errors);
        return;
    }
    if (password != confirm_password) {
        errors.message = "Passsword and confirm-password doesnot match";
        res.status(200).json(errors);
        return;
    }
    if (password.trim().length < 6 || password.trim().length > 15) {
        errors.message = "Password length must be 6 - 15 character.";
        res.status(200).json(errors);
        return;
    }
    const hashedPassword = await hashPassword(password);
    if (isValid) {
        const updateUserPassword = await UserSchema.findByIdAndUpdate({_id:userId},{password:hashedPassword}).exec();
        console.log("updateUserPassword",updateUserPassword);
        return res.send({ success: true, message: "Password changed successfully"});
    } else {
        errors.message = "The reset token has expired";
        res.status(200).json(errors);
        return;
    }
    
    // const checkUser = await UserSchema.findOne({email:email}).exec();
    // if (!checkUser) {
    //     errors.message = "email id doesn't exist";
    //     res.status(200).json(errors);
    //     return;
    // }
    // const expiringToken = generateExpiringToken();
    // const mailOptions = {
    //     from: 'darkomtourism@gmail.com',
    //     to: email,
    //     subject: 'Forgot Password',
    //     html: `<p>Click the following link to reset your password (Link valid for 15 mins):</p>
    //            <a href="http://127.0.0.1:3112/forgot-password-two/${checkUser._id+'$'+expiringToken}">Reset Password</a>`
    //   };
    
    //   transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //       console.log('Error sending email:', error);
    //     } else {
    //       console.log('Email sent:', info.response);
    //     }
    //   });
    //   return res.send({ success: true, message: "Please check your mail inbox"});
    // console.log("checkUser",checkUser);
};
// const generateExpiringToken = () => {
//     const token = cryptoRandomString({ length: 20 }); // Generate a random token
//     const expiration = Date.now() + 5 * 60 * 1000; // Set expiration time to 5 minutes from now
//     return `${token}_${expiration}`; // Combine token and expiration time
//   };
const generateExpiringToken = () => {
    const token = crypto.randomBytes(20).toString('hex'); // Generate a random token
    const expiration = Date.now() + 5 * 60 * 1000; // Set expiration time to 5 minutes from now
    // const expiration = Date.now() + 15 * 60 * 1000; // Set expiration time to 15 minutes from now
    const expiringToken = `${token}_${expiration}`; // Combine token and expiration time
    return expiringToken;
  };
  // Verify an expiring token
const verifyExpiringToken = (token) => {
    const [tokenValue, expiration] = token.split('_');
    const currentTime = Date.now();
  
    if (currentTime > parseInt(expiration, 10)) {
      // Token has expired
      return false;
    }
  
    // Token is still valid
    return true;
  };

  module.exports.addAccountDetails = async (req, res, next) => {
    try {
        console.log("addAccountDetails",req.body);
        const userId = req.body.id;
        const userData = await UserSchema.findById(userId);
        console.log("userData===========", userData);
        if (userData) {
            var obj = {};
            if (req.body.accountOwnerName) {
                obj.accountOwnerName = req.body.accountOwnerName
            }
            if (req.body.accountNumberOrIBAN) {
                obj.accountNumberOrIBAN = req.body.accountNumberOrIBAN
            }
            console.log("req.body.==========    ", req.body);

            const updateData = await UserSchema.findByIdAndUpdate(userId, obj, {
                new: true
            });
            const getUserData = await UserSchema.findById(userId);
            res.json({
                success: true,
                message: "User account data added successfully..",
                response_data: getUserData,
            })
        }
        else {
            res.json({
                success: false,
                message: "User id not found",
            })
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            message: `INTERNAL DB ERROR`,
        });
    }
}