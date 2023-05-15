var jwt = require("jsonwebtoken");
const UserSchema = require('../schema/api/users');

//define jwt
// module.exports = {
//   //middle ware of jwt validation
//   verifyToken: (req, res, next) => {
//     // console.log("print body", req.body);
//     // console.log("to get header", req.headers.authorization);

//     jwt.verify(req.headers.authorization, "vaseemm-scret-key", (err, decoded) => {

//       if (err) {
//         console.log(err);
//         res.send({
//           message: "please provide authentication token",
//           statuscode: 422,
//           success: false,
//           data: {},
//         });
//       } else if (decoded.data.userId) {
//         req.userID = decoded.data.userId
//         UserSchema.findOne({ _id: decoded.data.userId }).then((data) => {
//           if (data) {
//             console.log("data",data)
//             next();
//           } else {
//             res.send({
//               message: "please provide a valid token",
//               statuscode: 422,
//               success: false,
//               data: {},
//             });
//           }
//         })
//         // console.log(decoded);
//         // res.send({
//         //   message: "validation successfull",
//         //   statuscode: 200,
//         //   success: true,
//         //   data: {},
//         // });

//       } else {
//         res.send({
//           message: "please supply a valid token",
//           statuscode: 422,
//           success: false,
//           data: {},
//         });
//       }
//     });
//   },
// };


// var jwt = require("jsonwebtoken");
// const contextService = require('request-context');

// module.exports.allowIfLoggedin = async (req, res, next) => {

//     var HeaderToken = req.headers["authorization"];
//     if (!HeaderToken) {
//       return res.status(403).send({
//           "status":false,
//           "msg":"A token is required for authentication",
//           "data":[],
//       });
//     }
//     try {
//       var token = req.headers["authorization"].replace("Bearer ",'');
//       const decoded = jwt.verify(token,  "vaseemm-scret-key");
//       req.user = decoded;
//       contextService.set('request:user', decoded.userId);
//     } catch (err) {console.log(err)
//       return res.status(401).send({
//           "status":false,
//           "msg":"Invalid token provided.",
//           "data":[],
//       });
//     }
//     return next();
// }

// module.exports.allowIfLoggedin = async (req, res, next) => {

//     //let token = req.body.token || req.param('token') || req.headers['token']||'';
//     let token = req.body.token || req.query["token"] || req.headers['token'] || '';
//     //let bearToken = bearerHeader.split(' ');
//     //token=bearToken[1];
//     if (token) {
//         jwt.verify(token, secretKey, function (err, authData) {
//             if (err) {
//                 console.log('+++++9+++++');
//                 res.status(403).send({ success: false, type: 'Authentication error', message: "Authentication failed" });
//             } else {
//                 console.log('+++++000+++++');
//                 console.log('+++++000+++++' + authData.id);
//                 console.log('+++++000+++++' + authData.email);
//                 req.authData = authData;
//                 next();
//             }
//         });
//     } else {
//         res.status(403).send({ success: false, type: 'Authentication error', message: "Authentication token required" });
//     }
// };