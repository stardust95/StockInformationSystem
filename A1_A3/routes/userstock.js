var express = require('express');
var router = express.Router();
var Userstock = require("../models/userstock.js");

/* GET home page. */
router.get('/', function(req, res) {
    var username	 = req.session.user.username;	
	var userstock = new Userstock({
		account : username
	});
	userstock.userstockInfo(function(err,result){
		res.render('userstock', {data: result});

	});
  
});

module.exports = router;