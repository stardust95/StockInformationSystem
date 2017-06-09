var express = require('express');
var router = express.Router();
var User = require("../models/user.js");

/* GET home page. */
router.get('/', function(req, res) {
	var user = req.session.user;
	var login = new User({
		username : user.username
	});
	login.userInfo(function(err,result){
		res.render('editmainpage', {data: result});

	});
  
});

module.exports = router;
