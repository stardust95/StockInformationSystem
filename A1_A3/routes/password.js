var express = require('express');
var router = express.Router();
var User = require("../models/user.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('password');
});

/*Author: Zihan Zhao of A1*/
router.post('/',function(req, res) {
    var username		 = req.session.user.username;
    var oldpassword		 = req.body.oldpassword;
    var newpassword		 = req.body.newpassword;

    var ExaminePassword = new User({
            username : username,
            password : oldpassword
        });
    
	//通过用户名取到用户信息
	
    ExaminePassword.userInfo(function(err,result){
        if(err){
            //res.locals.status = "fail";
            var user = {'username':''};
            res.send({code: 0, msg: err, userinfo : user});
            //res.render('index', {errMsg: err });
            return;
        }
        else{
            //判断用户密码是否填写正确  演示没做加密，等有时间再加
            if(result[0]['password'] == oldpassword){
				ExaminePassword.updatePassword(newpassword,function (err, results) {
				console.log("updatePassword function calling");

				if(err){
					console.log("invalid update of Password");
					res.send({code:0, msg: '修改失败'});
					return;
				}
				else
				{
					console.log("Here i am~");
					res.send({code:200, msg: '修改成功'});
					return;
					//res.redirect('/mainpage');
				}
			});
                
            }
            else{
                //res.locals.status = "fail";
                var user = {'username':''};
                //res.locals.status = "fail";
                console.log('* 密码错误');
                res.send({code: 0, msg: '原密码错误'});
                //res.render('index', {errMsg: ' * 用户名或密码错误' });
            }
        }
    });
    
    //检查用户名是否已经存在
   
});


module.exports = router;
