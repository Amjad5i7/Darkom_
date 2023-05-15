var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const contextService = require('request-context');
const bodyParser = require('body-parser');
const http = require("http");
const https = require("https");
const fs = require("fs");
var passport = require('passport');
var flash    = require('connect-flash');
var session      = require('express-session');
const passportConfig = require('./passport-config');
// Initialize Passport
passportConfig(passport);

const toastr = require('express-toastr');

const con = require("./config");
const cors = require('cors');
//const configDB = 
//require("./config/connection");
//const config = con.development;
global.config = con;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/apiRoutes');
var aboutRouter = require('./routes/about');
var serviceRouter = require('./routes/services');
var addplanRouter = require('./routes/addPlan');
var addactivitiesRouter = require('./routes/addActivities');
var activitiesserviceRouter = require('./routes/activitiesServices');
var activitiesserviceproviderRouter = require('./routes/activitiesServicesProvider');
var plansServiceRouter = require('./routes/plansServices');
var activitiedetailsServiceRouter = require('./routes/activitieDetailsServices');
var plandetailsServiceRouter = require('./routes/planDetailsServices');
var reservationRouter = require('./routes/reservation');
var loginRouter = require('./routes/login');
var loginSuccessRouter = require('./routes/loginSuccess');
var registrationSuccessRouter = require('./routes/registrationSuccess');
var registrationRouter = require('./routes/registration');
var serviceRegistrationRouter = require('./routes/serviceRegistration');
var testRoute = require('./routes/testRoute');

// var usersRouter = require('./routes/users');
// var usersRouter = require('./routes/users');

var app = express();

const server = http.createServer(app);

/* connect flash configuration */
// Set up session and flash messages
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


    app.use(toastr());
//===========================Connect to MongoDB==========================

//var db = config.database['local'];
//var connectionString = "mongodb://" + db.host + ":" + db.port + "/" + db.dbName
mongoose.connect("mongodb+srv://darkomtourism:75hvi8hyaWkrMPAW@darkom-tourism.lawwdxe.mongodb.net/test", function (err) {
  if (err) {
    console.log(err)
  } else {
    console.log('Connected to database darkomtourism');
  }
});

mongoose.set('debug', true);
//===========================Connect to MongoDB==========================
// Express session
// app.use(
//   session({
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: true
//   })
// );
// app.use(session({
//   name:'some_session',
//   secret: 'lalala',
//   resave: true,
//   saveUninitialized: false,
//   cookie: { maxAge: 365 * 24 * 60 * 60 * 1000,httpOnly: false , domain:'127.0.0.1:3112'}
// }));
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});
// Enable CORS for all routes
app.use(cors());
// Global variables
// app.use(function(req, res, next) {
//   res.locals.success_msg = req.flash('success_msg');
//   res.locals.error_msg = req.flash('error_msg');
//   res.locals.error = req.flash('error');
//   next();
// });

// for parsing application/json
app.use(
  bodyParser.json({
      limit: "50mb",
  })
);
// for parsing application/xwww-form-urlencoded
app.use(
  bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
  })
);

// // view engine setup
// app.use(bodyParser.urlencoded({ extended: true }))

// // // parse application/json
// app.use(bodyParser.json())
// app.use(express.bodyParser());
// app.use(session({                                           
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(contextService.middleware('request'));
app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'uploads')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/about', aboutRouter);
app.use('/services', serviceRouter);
app.use('/add-activities', addactivitiesRouter);
app.use('/add-plan', addplanRouter);
app.use('/activities-services', activitiesserviceRouter);
app.use('/activities-services-provider', activitiesserviceproviderRouter);
app.use('/plans-services', plansServiceRouter);
app.use('/activity-details-services/:serviceId', activitiedetailsServiceRouter);
app.use('/plan-details-services/:planId', plandetailsServiceRouter);
app.use('/reservation/:id', reservationRouter);
app.use('/login', loginRouter);
app.use('/loginSuccess', loginSuccessRouter);
app.use('/registrationSuccess', registrationSuccessRouter);
app.use('/serviceRegistration', serviceRegistrationRouter);
app.use('/registration', registrationRouter);
app.use('/testData', testRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;


global.appRoot = __dirname;

var port = con.port;
global.appPort = port;
module.exports.httpServer = server.listen(port, () => {
  console.log("Listening on 'http://127.0.0.1:" + port);
});

