var express = require('express');
var router = express.Router();
var User = require("../models/user.js");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {errMsg:""});
});

router.post('/',function(req, res) {
    var username		 = req.body.username;
    var password		 = req.body.password;
    var type			 = req.body.type;
    var	status			 = req.body.status;
    var name			 = req.body.name;
    var card_type        = req.body.cardtype;
    var passport         = req.body.passport;
    var id_card			 = req.body.id_card;
    var gender			 = req.body.gender;
    var phone			 = req.body.phone;
    var email			 = req.body.email;
    var address			 = req.body.address;
    var occupation		 = req.body.occupation;
    var education		 = req.body.education;
    var workplace		 = req.body.workplace;
    var agent_id		 = req.body.agent_id;
    var business_license = req.body.business_license;
    var manager_name	 = req.body.manager_name;
    var manager_id_card	 = req.body.manager_id_card;
    var manager_phone	 = req.body.manager_phone;

    if(card_type > 0){
        id_card = passport;
    }
    
    var newUser = new User({
        username		 : username,
        password		 : password,
        type			 : type,
        status 			 : status,
        id_card			 : id_card,
        name			 : name,
        gender			 : gender,
        phone			 : phone,
        email			 : email,
        address			 : address,
        occupation		 : occupation,
        education		 : education,
        workplace		 : workplace,
        agent_id		 : agent_id,
        business_license : business_license,
        manager_name	 : manager_name,
        manager_id_card	 : manager_id_card,
        manager_phone	 : manager_phone
    });

    //检查用户名是否已经存在
    newUser.userNum(newUser.username, function (err, results) {
        if (results != null && results[0]['num'] > 0) {
            err = ' * 用户名已存在';
        }

        if (err) {
            user = {'username':''};
            console.log("注册失败");
            res.send({code:0, msg: err, userinfo : user});
            //res.render('index', {errMsg: err });
            return;
        }
        newUser.userSave(function(err,result){
            if(err){
                user = {'username':''};
                console.log("注册失败");
                res.send({code:0, msg: err, userinfo : user});
                //res.render('index', {errMsg: err });
                return;
            }
            if(result.insertId > 0){
                res.locals.status = "success";
                var user = {'username':username};
                console.log("注册成功");
                //req.session.user = user;//保存用户session信息
                res.send({code:200, msg:'注册成功', userinfo : user});
                //res.render('index', {errMsg:'' });
            }
            else{
                user = {'username':''};
                console.log("注册失败");
                res.send({code:0, msg: err, userinfo : user});
                //res.render('index', {errMsg: err });
            }
        });
    });
});

module.exports = router;
