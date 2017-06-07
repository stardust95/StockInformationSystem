function cancelOrder(own){
    $("#msk").css("display","block");
    var order = $(own).parent().parent().children().get(4).innerHTML;
    var submitOrderOBJ = {
        orderID:order
    }
    $.ajax({
        url: "users/deleteOrder",
        type: "post",
        data: submitOrderOBJ,
        dataType: "json",
        success: function(data) {
            console.log(data);
            var obj=data;
            if(obj.status=="0"){
                alert(obj.info);
            }else{
                alert("撤销成功");
                deleteEntries(obj.data,"W");
                if(obj.data[0].buyOrSell == "0")
                    deleteEntries(obj.data,"B");
                else
                    deleteEntries(obj.data,"S");
            }
            displayUpdateAll();
            $("#msk").css("display","none");
        },
        error: function(req,stat,err) {
            alert("系统错误！");
            displayUpdateAll();
            $("#msk").css("display","none");
        }
    });

}
