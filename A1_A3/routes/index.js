var express = require('express');
var User = require("../models/user.js");
var Admin = require("../models/admin.js");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index',{ errMsg: '' });
});


module.exports = router;
