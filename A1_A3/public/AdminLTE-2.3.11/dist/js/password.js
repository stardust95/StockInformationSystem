/**
 * Created by pankaicheng on 17/5/31.
 */
$().ready(function () {

    $("#password_form").validate({
        submitHandler : function(form) {  //验证通过后的执行方法
            //当前的form通过ajax方式提交（用到jQuery.Form文件）
            //alert("提交表单");
            //alert("提交表单");
            $(form).ajaxSubmit({
                dataType:"json",
                success:function( jsondata ){
                    if( jsondata.code == 200 ){
                        alert(jsondata.msg);
                        window.location.href = "/password";
                    }else{
                        alert(jsondata.msg);
                    }
                }
            });

        },
        rules: {
            oldpassword: {
                required: true,
                minlength: 6,
                maxlength: 20
            },
            newpassword: {
                required: true,
                minlength: 6,
                maxlength: 20
            },
            repassword: {
                equalTo: "#new_password"
            }
        },
        messages: {
            oldpassword: {
                required: "*请旧密码",
                minlength: jQuery.validator.format("*用户名不能小于{0}个字符"),
                maxlength: jQuery.validator.format("*用户名不能大于{0}个字符"),
                notnumber: "*用户名不能是纯数字"
            },
            newpassword: {
                required: "*请输入新密码",
                minlength: jQuery.validator.format("*密码不能小于{0}个字符"),
                maxlength: jQuery.validator.format("*密码不能大于{0}个字符")
            },
            repassword: {
                equalTo: "*两次密码不同"
            }
        }

    });

});