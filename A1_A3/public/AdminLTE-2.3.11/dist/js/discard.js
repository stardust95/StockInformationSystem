/**
 * Created by pankaicheng on 17/5/31.
 */
$().ready(function () {

    $("#discard_form").validate({
        submitHandler : function(form) {  //验证通过后的执行方法
            //当前的form通过ajax方式提交（用到jQuery.Form文件）
            //alert("提交表单");
            //alert("提交表单");
            $(form).ajaxSubmit({
                dataType:"json",
                success:function( jsondata ){
                    if( jsondata.code == 200 ){
                        alert(jsondata.msg);
                        window.location.href = "/mainpage";
                    }else{
                        alert(jsondata.msg);
                    }
                }
            });

        },
        rules: {
            name: {
                required: true
            },
            idnumber: {
                required : true,
                minlength: 18,
                maxlength: 18
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 20
            }
        },
        messages: {
            name: {
                required: "*请输入姓名"
            },
            idnumber:{
                required: "*请输入身份证号",
                minlength: jQuery.validator.format("*请输入正确的身份证号"),
                maxlength: jQuery.validator.format("*请输入正确的身份证号")
            },
            password: {
                required: "*请输入密码",
                minlength: jQuery.validator.format("*密码不能小于{0}个字符"),
                maxlength: jQuery.validator.format("*密码不能大于{0}个字符")
            }
        }

    });

});