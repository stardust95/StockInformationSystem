/**
 * Created by Zihan Zhao
 * Modified by pankaicheng on 17/5/24. (Ajax modification)
 * Modified by Zihan Zhao on 17/6/1. (Account Status Examine) 
 */
var express = require('express');
var User = require("../models/user.js");
var Admin = require("../models/admin.js");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    if (req.session.user !=  null){
        var user = req.session.user;
        console.log(user.username);
        res.send({code: 0, msg: '用户已登录', userinfo : user});
    }
    else {
        user = {'username':''};
        console.log("没有session");
        res.send({code:0, msg: '用户未登陆', userinfo : user});
    }
    res.end();
    //res.render('main', { username:user.username});
});

router.post("/",function(req, res) {
    //获取form表单提交的登录数据
    var username = req.body.username;
    var password = req.body.password;
    var type	 = req.body.loginType;
    console.log(username);
    console.log(type);
    if(type == "user")
        var login = new User({
            username : username,
            password : password
        });
    else if(type == "admin")
        var login = new Admin({
            username : username,
            password : password
        });
    else {
        //res.locals.status = "fail";
        res.render('index', {errMsg: '请选择用户类型' });
        return;
    }
    //通过用户名取到用户信息
    login.userInfo(function(err,result){
        if(err){
            //res.locals.status = "fail";
            var user = {'username':''};
            res.send({code: 0, msg: err, userinfo : user});
            //res.render('index', {errMsg: err });
            return;
        }
        if(result == ''){
            var user = {'username':''};
            //res.locals.status = "fail";
            console.log('* 用户名或密码错误');
            res.send({code: 0, msg: ' * 用户名或密码错误', userinfo : user});
            //res.render('index', {errMsg: ' * 用户名或密码错误' });
        }
        else{
            //判断用户密码是否填写正确  演示没做加密，等有时间再加
            if(result[0]['password'] == password){
				//判断用户状态				
				var user = {'username':username};
				
				switch(result[0]['userstatus'])
				{
					case "Valid":
					case "Close":	
					case "CloseNotPass":					
					{						
						if(type == "user")
						{
							req.session.user = user;//保存用户session信息
							res.send({code:1, msg:'登录成功', userinfo : user});
						}
						//res.redirect('/main');
						else if(type == "admin")
						{
							res.send({code:1, msg:'登录成功', userinfo : user});
							//res.redirect('/mainManage');
						}
						break;
					}
					case "OpenApply":
					{
						//res.locals.status = "fail";
						console.log('* 开户申请尚未通过');
						res.send({code: 2, msg: ' * 开户申请尚未通过', userinfo : user});
						break;
					}
					case "LossReport":
					{
						//res.locals.status = "fail";
						console.log('* 账户申请挂失');
						res.send({code: 3, msg: ' * 账户已申请挂失，拒绝登录', userinfo : user});
						break;
					}
				}				 

            }
            else{
                //res.locals.status = "fail";
                var user = {'username':''};
                //res.locals.status = "fail";
                console.log('* 用户名或密码错误');
                res.send({code: 0, msg: ' * 用户名或密码错误', userinfo : user});
                //res.render('index', {errMsg: ' * 用户名或密码错误' });
            }
        }
        res.end();
    });
});


module.exports = router;
