
function submitOrder(){
    $("#msk").css("display","block");
    var buyOrSell = $("#buyOrSell option:selected").text();
    var way = $("#way option:selected").text().substring(2);
    var orderNum = $("#orderNum").val();
    var price = $("#price").val();

    if(buyOrSell=="买"){
        buyOrSell="0";
    }else{
        buyOrSell="1";
    }
    var submitOrderOBJ={
        buyOrSell:buyOrSell,
        way:way,
        orderNum:orderNum,
        price:price
    };

// 以下测试用，实际连接后端时整段注释，然后把ajax那段uncomment
//     alert("success!")
//     submitOrderOBJ.orderID = Math.random();
//     if(submitOrderOBJ.buyOrSell=="1") submitOrderOBJ.orderID++;
//     insertEntries([submitOrderOBJ],submitOrderOBJ.buyOrSell=="0"?"B":"S");
//     displayUpdateAll();
//     $("#msk").css("display","none");


    $.ajax({
            url: "users/checkOrder",
            type: "post",
            data: submitOrderOBJ,
            dataType: "json",
            success: function(data) {
                var obj=data;
                if(obj.status=="0"){
                    alert(obj.info);
                }else{
                    alert("挂单成功");
                    insertEntries([obj.data],"W");
                    if(obj.data.buyOrSell == "0")
                        insertEntries([obj.data],"B");
                    else
                        insertEntries([obj.data],"S");
                }
                displayUpdateAll();
                $("#msk").css("display","none");
            },
            error: function(req,stat,err) {
            //    alert(req.status);
            //    alert(req.readyState);
            //    alert(stat);
            //    alert(err);
                alert("系统错误！");
                displayUpdateAll();
                $("#msk").css("display","none");
            }
        });


}

function hide(){
    $("#msk").css("display","block");
}
