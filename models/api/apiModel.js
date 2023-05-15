'use strict';
var UserSchema = require('../../schema/api/users');
var config = require('../../config');
var async = require("async");
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var https = require('https');
var request = require('request');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;

/*createToken = (admin) => {
    var tokenData = {
        id: admin._id
    };
    var token = jwt.sign(tokenData, secretKey, { 
        expiresIn: '30d'
    });
    return token;
};*/
var apiModel = {

    //register employee
    register: async function (data, callback) {


        if (data) {
            const phoneCheck = UserSchema.findOne({ email: 'sam2.paul@brainiuminfotech.com', phoneNumber: '987656789' });

            phoneCheck.exec(function (err, user) {
                if (err) {
                    console.error(err);
                    callback({
                        response_code: 505,
                        message: "INTERNAL DB ERROR",
                        response: []
                    });
                } else {
                    console.log(user);
                    if (user != null) {

                        callback({
                            "response_code": 404,
                            "message": "Phone No already exist.",
                            "response_data": {}
                        });

                        return;
                    }
                }
            });
            /*let phoneCheck = await UserSchema.findOne({
                email: data.email,
                phoneNumber: data.phoneNumber
            }, function (err, result) {
                if (err) {
                    callback({
                        response_code: 505,
                        message: "INTERNAL DB ERROR",
                        response: {}
                    });
    
                }
                else {
                    callback({
                        "response_code": 404,
                        "message": "Phone Not exist.",
                        "response_data": {}
                    });
                }
            });*/




            const emailCheck = UserSchema.findOne({ email: 'sam2.paul@brainiuminfotech.com' });

            emailCheck.exec(function (err, user) {
                if (err) {
                    console.error(err);
                    callback({
                        response_code: 505,
                        message: "INTERNAL DB ERROR",
                        response: []
                    });
                } else {
                    console.log(user);
                    if (user != null) {
                        callback({
                            response_code: 404,
                            message: "Email address already exist",
                            response: user
                        });
                    }
                    else {
                        new UserSchema(data).save(async function (err, result) {
                            if (err) {
                                callback({

                                    response_code: 505,
                                    message: "INTERNAL DB ERROR",
                                    response: []
                                });
                            } else {



                                callback({

                                    response_code: 200,
                                    message: "Registered successfully.Please check email for verify account.",
                                    response: {}
                                });
                            }
                        });
                    }
                }
            });







            /*UserSchema.findOne({
                    email: data.email
                }, {
                    _id: 1,
                    email: 1,
                },
                function (err, result) {
                    if (err) {
                        callback({
                            
                            response_code: 505,
                            message: "INTERNAL DB ERROR",
                            response: []
                        });
                    } else {
                        if (result != null) {
                            callback({
                                
                                response_code: 404,
                                message: "Email address already exist",
                                response: result
                            });
                        } else {
 
                            new UserSchema(data).save(async function (err, result) {
                                if (err) {
                                    callback({
                                        
                                        response_code: 505,
                                        message: "INTERNAL DB ERROR",
                                        response: []
                                    });
                                } else {
 
                                    let otp = Math.random().toString().replace('0.', '').substr(0, 4);
 
                                    await UserSchema.updateOne({_id:result._id},
                                        {
                                            $set:{
                                                otp : otp
 
                                            }
                                        })
 
                                    mailProperty('welcomeMail')(data.email, {
                                        name: data.firstName+ ' ' + data.lastName,
                                        email: data.email,
                                        verification_code: otp,
                                        site_url: config.liveUrl,
                                        date: new Date()
                                    }).send();
 
                                    callback({
                                        
                                        response_code: 200,
                                        message: "Registered successfully.Please check email for verify account.",
                                        response: {}
                                    });
                                }
                            });
                        }
                    }
                });*/
        } else {
            callback({

                response_code: 505,
                message: "INTERNAL DB ERROR",
                response: []
            });
        }
    },

    //login
    login: async function (data, callback) {


        if (data) {

            UserSchema.findOne({ email: data.email }, function (err, result) {
                if (err) {
                    callback({

                        response_code: 505,
                        message: "INTERNAL DB ERROR",
                        response: []
                    });

                } else {

                    if (result === null) {

                        callback({

                            response_code: 404,
                            message: "Wrong email. Please provide registered details.",
                            response: []
                        });


                    } else if (result.deleted == 'yes') {

                        callback({

                            response_code: 404,
                            message: "Your account has been deleted.Please contact to admin.",
                            response: []
                        });
                    } /*else if (result.status == 'no') {
                        
                            callback({
                                
                                response_code: 403,
                                message: "Your account is temporarily blocked. Please contact admin.",
                                response: {
                                    _id: result._id,
                                    firstName: result.firstName,
                                    lastName: result.lastName,
                                    email: result.email
                                }
                            });
                    } else if (result.email_verify == 'no') {
                            
                        callback({
                            
                            response_code: 5008,
                            message: "Your account is not activated.",
                            response: {
                                _id: result._id,
                                firstName: result.firstName,
                                lastName: result.lastName,
                                email: result.email
                            }
                        });
                    } else if (result.govtIssuedId == null && result.facePhoto == null) {
                            
                        callback({
                            
                            response_code: 5009,
                            message: "Your face photo and gov id not uploaded.",
                            response: {
                                _id: result._id,
                                firstName: result.firstName,
                                lastName: result.lastName,
                                email: result.email
                            }
                        });
                    } else if (result.doc_verify == 'rejected' ) {
                            
                        callback({
                            
                            response_code: 5009,
                            message: "Your face photo and gov id not match.Please uploaded again.",
                            response: {
                                _id: result._id,
                                firstName: result.firstName,
                                lastName: result.lastName,
                                email: result.email
                            }
                        });
                    } else if (result.doc_verify == 'pending' ) {
                            
                        callback({
                            
                            response_code: 404,
                            message: "Your face photo and gov id verification pending by admin.",
                            response: {
                                _id: result._id,
                                firstName: result.firstName,
                                lastName: result.lastName,
                                email: result.email
                            }
                        });
                    }*/ else {

                        bcrypt.compare(data.password.toString(), result.password, function (err, response) {
                            // result == true
                            if (response == true) {

                                //var token = createToken(result);
                                var token = "dafdgfhgkhkhkhkkjkjlkj";
                                UserSchema.updateOne({
                                    _id: result._id
                                }, {
                                    $set: {
                                        deviceToken: data.deviceToken,
                                        appType: data.appType
                                    }
                                }, function (err, resUpdate) {
                                    if (err) {
                                        callback({

                                            response_code: 505,
                                            message: "INTERNAL DB ERROR",
                                            response: []
                                        });
                                    } else {



                                        var all_result = {
                                            authtoken: token,
                                            _id: result._id,
                                            firstName: result.firstName,
                                            lastName: result.lastName,
                                            email: result.email,
                                            phoneNumber: result.phoneNumber,
                                            user_type: result.userType
                                        }
                                        callback({

                                            response_code: 200,
                                            message: "Logged your account",
                                            response: all_result
                                        });
                                    }
                                });
                            } else {
                                callback({


                                    response_code: 404,
                                    message: "Wrong password or email. Please provide registered details.",
                                    response: []
                                });
                            }
                        });
                    }
                }

            })
        } else {
            callback({

                response_code: 505,
                message: "INTERNAL DB ERROR",
                response: {}
            });
        }
    },
}
module.exports = apiModel;