var express = require('express');
var router = express.Router();
var User = require("../models/user.js");

router.get('/', function(req, res, next) {
	var user = req.session.user;
	var login = new User({
		username : user.username
	});
	login.userInfo(function(err,result){
		console.log("Edit result:");
		console.log(result);
		res.render('mainpage', {data: result});
	});
});

router.post('/',function(req, res) {
    var username		 = req.session.user.username;
    var name			 = req.body.name;
    var gender			 = req.body.gender;
    var phone			 = req.body.phone;
    var email			 = req.body.email;
    var address			 = req.body.address;
    var occupation		 = req.body.occupation;
    var education		 = req.body.education;
    var workplace		 = req.body.workplace;
    var business_license = req.body.business_license;
    var manager_name	 = req.body.manager_name;
    var manager_id_card	 = req.body.manager_id_card;
    var manager_phone	 = req.body.manager_phone;

    var newUser = new User({
    	username         : username,
        name             : name,
        gender           : gender,
        phone            : phone,
        email			 : email,
        address			 : address,
        occupation		 : occupation,
        education		 : education,
        workplace		 : workplace,
        business_license : business_license,
        manager_name	 : manager_name,
        manager_id_card	 : manager_id_card,
        manager_phone	 : manager_phone
    });

    newUser.updateInfo(function (err, results) {
		console.log("updateInfo function calling");
    	if(err){
    		console.log("invalid update");
    		res.send({code:0});
    		return;
    	}
    	else
    	{
    		res.send({code:200});
    		//res.redirect('/mainpage');
    	}

    });
    //检查用户名是否已经存在
   
});

module.exports = router;
