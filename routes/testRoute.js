var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  //res.render('pages/plans-services', { title: 'Darkom | Plans' })
  console.log("objectres",req.body);
});

module.exports = router;            