/*Author: Zihan Zhao of A1*/
var express = require('express');
var router = express.Router();
var User = require("../models/user.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('discard');
});

router.post('/',function(req, res) {
    var username	 = req.session.user.username;
    var idnumber	 = req.body.idnumber;
    var name		 = req.body.name;
    var password	 = req.body.password;

    var CloseApply = new User({
            username : username,
            password : password,
			id_card	 : idnumber,
			name	 : name
			});
    
	//通过用户名取到用户信息
	
    CloseApply.userInfo(function(err,result){
        if(err){
            //res.locals.status = "fail";
            var user = {'username':''};
            res.send({code: 0, msg: err, userinfo : user});
            //res.render('index', {errMsg: err });
            return;
        }
        else{
            //判断用户身份信息是否填写正确
            if(result[0]['password'] == password
			 && result[0]['id_card'] == idnumber
			 && result[0]['name'] 	 == name){
				CloseApply.CloseApply(function (err, results) {
				console.log("CloseApply function calling");
				if(err){
					console.log("invalid Apply to close account");
					res.send({code:0, msg: '销户申请失败'});
					return;
				}
				else
				{
					res.send({code:200, msg: '销户申请成功,请等待管理员审核'});
					return;
				}
			});
                
            }
            else{
                //res.locals.status = "fail";
                var user = {'username':''};
                //res.locals.status = "fail";
                console.log('* 用户信息有误');
                res.send({code: 0, msg: '用户信息有误'});
                //res.render('index', {errMsg: ' * 用户名或密码错误' });
            }
        }
    });
    
    //检查用户名是否已经存在
   
});

module.exports = router;
