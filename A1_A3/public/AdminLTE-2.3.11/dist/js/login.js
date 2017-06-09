/**
 * Created by pankaicheng on 17/5/19.
 * Modified by Zihan Zhao on 17/6/1  "add notification type"
 */
$().ready(function () {

    $("#login_form").validate({
        submitHandler : function () {
            var log_type = $("input[name='loginType']:checked").val();
            $.post("/login",
                {
                    username: $('#login_bond_id').val(),
                    password: $('#login_password').val(),
                    loginType: log_type
                },
                function (result) {

                    if (result.code==0){
                        //alert("提示：" + result.msg);
                        $('#login-modal').modal('show');
                        $('#register-li').removeClass('active');
                        $('#register-tab').removeClass('active');
                        $('#login-tab').addClass('active');
                        $('#login-li').addClass('active');
                        $("#login_error").html(" * 用户名或密码错误");
                        $("#user-menu").hide();
                        //alert("done");
                    }
                    if (result.code==2){
                        //alert("提示：" + result.msg);
                        $('#login-modal').modal('show');
                        $('#register-li').removeClass('active');
                        $('#register-tab').removeClass('active');
                        $('#login-tab').addClass('active');
                        $('#login-li').addClass('active');
                        $("#login_error").html(" * 开户申请尚未通过");
                        $("#user-menu").hide();
                        //alert("done");
                    }
                    if (result.code==3){
                        //alert("提示：" + result.msg);
                        $('#login-modal').modal('show');
                        $('#register-li').removeClass('active');
                        $('#register-tab').removeClass('active');
                        $('#login-tab').addClass('active');
                        $('#login-li').addClass('active');
                        $("#login_error").html(" * 账户已申请挂失，拒绝登录");
                        $("#user-menu").hide();
                        //alert("done");
                    }
                    else if (result.code ==1){
                        alert("登录成功");
                        if(log_type == "admin")
                        {
                            window.location.href = "/mainManage";
                        }
                        else
                        {
                            $('#login-modal').modal('hide');
                            $("#login-button").hide();
                            $("#register-button").hide();
                            $("#user-menu").show();
                            $("#user-menu-name").text(result.userinfo.username);
                            $("#dropdown-user-name").text(result.userinfo.username);
                        }
                        
                    }
                }
            )
        },
        rules: {
            username: {
                required: true,
                minlength: 5,
                maxlength: 20
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 20
            }
        },
        messages: {
            username: {
                required: "*请输入用户名",
                minlength: jQuery.validator.format("*用户名不能小于{0}个字符"),
                maxlength: jQuery.validator.format("*用户名不能大于{0}个字符"),
                notnumber: "*用户名不能是纯数字"
            },
            password: {
                required: "*请输入密码",
                minlength: jQuery.validator.format("*密码不能小于{0}个字符"),
                maxlength: jQuery.validator.format("*密码不能大于{0}个字符")
            }
        }

    });

});
/*
$("#login-btn").click(function () {
    var log_type = $("input[name='loginType']:checked").val();
    //alert(log_type);
    $.post("/login",
        {
            username: $('#login_bond_id').val(),
            password: $('#login_password').val(),
            loginType: log_type
        },
        function (result) {
            //alert("code="+result.code);
            if (result.code==0){
                //alert("提示：" + result.msg);
                $('#login-modal').modal('show');
                $('#register-li').removeClass('active');
                $('#register-tab').removeClass('active');
                $('#login-tab').addClass('active');
                $('#login-li').addClass('active');
                $("#login_error").html(" * 用户名或密码错误");
                $("#user-menu").hide();
                //alert("done");
            }
            else if (result.code ==1){
                $('#login-modal').modal('hide');
                $("#login-button").text("");
                $("#register-button").text("");
                $("#user-menu").show();
                $("#user-menu-name").text(result.userinfo.username);
                alert("登录成功");
            }
        }
    )
});*/