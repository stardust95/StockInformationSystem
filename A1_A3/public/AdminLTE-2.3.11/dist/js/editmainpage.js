/**
 * Created by pankaicheng on 17/5/31.
 */
jQuery.validator.addMethod(
    "type0",
    function (value, element, param) {
        var type_val= $("input[name='optionsRadios']:checked").val()
        if (type_val === 1)
            return true;
        else {
            if (value.length === 0) {
                return false
            }
            else {
                return true;
            }
        }
    },
    $.validator.format("请输入正确的信息")
);

$().ready(function () {

    $("#edit_form").validate({
        submitHandler : function(form) {  //验证通过后的执行方法
            //当前的form通过ajax方式提交（用到jQuery.Form文件）
            alert("提交表单");
            $(form).ajaxSubmit({
                dataType:"json",
                success:function( jsondata ){
                    if( jsondata.code == 200 ){
                        alert("修改成功");
                        window.location.href = "/mainpage";
                    }else{
                        alert("修改失败");
                    }
                }
            });

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
            },
            repassword: {
                equalTo: "#password1"
            },
            email: {
                required: true,
                email: true
            },
            id_card:{
                required : true,
                minlength: 18,
                maxlength: 18
            },
            name:{
                required : true
            },
            phone:{
                required : true,
                number: true,
                minlength: 11,
                maxlength: 11
            },
            address:{
                type0:true
            },
            occupation:{
                type0:true
            },
            workplace:{
                type0:true
            },
            manager_name:{
                required: true
            },
            manager_id_card:{
                required: true,
                minlength: 18,
                maxlength: 18
            },
            manager_phone:{
                required: true
            },
            business_license:{
                required : true
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
            },
            repassword: {
                equalTo: "*两次密码不一样"
            },
            email: {
                required: "*请输入邮箱",
                email: "*请输入有效邮箱"
            },
            id_card:{
                required: "*请输入身份证号",
                minlength: jQuery.validator.format("*请输入正确的身份证号"),
                maxlength: jQuery.validator.format("*请输入正确的身份证号")
            },
            name:{
                required: "*请输入您的姓名"
            },
            phone:{
                required: "*请输入手机号",
                number: '*手机号只能是纯数字',
                minlength: jQuery.validator.format("*请输入正确的手机号"),
                maxlength: jQuery.validator.format("*请输入正确的手机号")
            },
            address:{
                type0: jQuery.validator.format("*请输入您的住址")
            },
            occupation:{
                type0: jQuery.validator.format("*请输入您的职业")
            },
            workplace:{
                type0: jQuery.validator.format("*请输入您的工作地点")
            },
            manager_name:{
                required: jQuery.validator.format("*请输入经理的姓名")
            },
            manager_id_card:{
                required: jQuery.validator.format("*请输入经理的身份证号"),
                minlength: jQuery.validator.format("*请输入正确的身份证号"),
                maxlength: jQuery.validator.format("*请输入正确的身份证号")
            },
            manager_phone:{
                required: jQuery.validator.format("*请输入经理的联系方式")
            },
            business_license:{
                required : jQuery.validator.format("*请输入营业执照")
            }
        }

    });

});
$('#edit_btn').click(function () {
    alert("clik the button");
});