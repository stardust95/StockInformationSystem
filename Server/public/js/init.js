// 本代码中常出现的后缀：
// W代表own，即自己的挂单
// B代表buy，即买单
// S代表sell，即卖单
// 另外注意：
// 本代码中，一条买/卖挂单有JSON（obj）和数值数组（arr）两种形态，后者的顺序是[价格 手数 挂单ID]。

$(function () {

// 以下测试用
    listW = [];
    listB = [];
    listS = [];

// 连接后端才正常运作，所以先initList注释掉了，用的是上面的测试数据
    initList();
    $("#msk").css("display", "None");
    displayUpdateAll();
    waitTime();


});

function displayUpdateAll() {
    displayUpdate("W");
    displayUpdate("B");
    displayUpdate("S");
}

function displayUpdate(label) {
    var id = "list" + label;
    var list = [];
    var dt;
    if (label == "W") { list = listW; }
    else if (label == "B") { list = listB; }
    else if (label == "S") { list = listS; }
    dt = $("#" + id).DataTable();
    dt.clear();
    if(list.length == 0)
        dt.row.add(["无","无","无","无","无","无"]).draw();
    var i;
    for (i = 0; i < list.length; i++) {
        if (label != "W") {
            dt.row.add([i + 1 + ".", list[i][0], list[i][1], list[i][2]]).draw();
        } else {
            // TODO: 用listW来更新dataTable。因为列更多了，所以不能和listB和listS共用
            if(list[i][0] == 0)
                dt.row.add([i + 1 + ".", "买", list[i][1], list[i][2],list[i][3],
                    ' <input type="button" id="1" class="btn btn-danger" onclick="cancelOrder(this);" value="撤销"/>']).draw();
            else
                dt.row.add([i + 1 + ".", "卖", list[i][1], list[i][2],list[i][3],
                    ' <input type="button" id="1" class="btn btn-danger" onclick="cancelOrder(this);" value="撤销"/>']).draw();
        }
    }
}

// 向三个list中（由label决定是哪个，B/S/W）插入多个数据。
function insertEntriesArr(toInsert, label) {
    var list = [];
    var tmp = [];
    if (label == "W") {
        list = listW;
        // TODO: 往listW中插入元素
        var i = 0;
        var j = 0;
        while (i < list.length && j < toInsert.length) {
            tmp[i + j] = list[i];
            if (list[i][0] > toInsert[j][0] || (list[i][0] == toInsert[j][0] && list[i][1] > toInsert[j][1])) {
                tmp[i + j] = toInsert[j];
                j++;
                continue;
            }
            tmp[i + j] = list[i];
            i++;
        }
        if (i == list.length) {
            tmp = tmp.concat(toInsert.slice(j));
        } else if (j == toInsert.length) {
            tmp = tmp.concat(list.slice(i));
        }
        listW = tmp;
    } else if (label == "S") {
        list = listS;
        var i = 0;
        var j = 0;
        while (i < list.length && j < toInsert.length) {
            tmp[i + j] = list[i];
            if (list[i][0] > toInsert[j][0]) {
                tmp[i + j] = toInsert[j];
                j++;
                continue;
            }
            tmp[i + j] = list[i];
            i++;
        }
        if (i == list.length) {
            tmp = tmp.concat(toInsert.slice(j));
        } else if (j == toInsert.length) {
            tmp = tmp.concat(list.slice(i));
        }
        listS = tmp;
    } else if (label == "B") {
        list = listB;
        var i = 0;
        var j = 0;
        while (i < list.length && j < toInsert.length) {
            tmp[i + j] = list[i];
            if (list[i][0] < toInsert[j][0]) {
                tmp[i + j] = toInsert[j];
                j++;
                continue;
            }
            tmp[i + j] = list[i];
            i++;
        }
        if (i == list.length) {
            tmp = tmp.concat(toInsert.slice(j));
        } else if (j == toInsert.length) {
            tmp = tmp.concat(list.slice(i));
        }
        listB = tmp;
    }
}

// 从三个list中删除多个数据
function deleteEntriesArr(toDelete, label) {
    var list = [];
    var tmp = [];
    if (label == "W") {
        list = listW;
        // TODO: 往listW中插入元素
        var i = 0;
        var j = 0;
        for(i=0;i<list.length;i++){
            for(j=0;j<toDelete.length;j++){
                if(list[i][3] == toDelete[j][3]){
                    break;
                }
            }
            if(j==toDelete.length){ // 没有挂单ID匹配的删除项
                tmp.push(list[i]);
            }
        }
        listW = tmp;

    } else {
        if(label=="B"){
            list = listB;
        }else if(label == "S"){
            list = listS;
        }
        var i = 0;
        var j = 0;
        for(i=0;i<list.length;i++){
            for(j=0;j<toDelete.length;j++){
                if(list[i][2] == toDelete[j][2]){
                    break;
                }
            }
            if(j==toDelete.length){ // 没有挂单ID匹配的删除项
                tmp.push(list[i]);
            }
        }
        if(label=="B"){
            listB = tmp;
        }else if(label == "S"){
            listS = tmp;
        }
    }
}

function insertEntries(obj, label) {
    toInsert = [];
    if(label == "W")
        toInsert = obj2arrW(obj);
    else
        toInsert = obj2arr(obj);
    insertEntriesArr(toInsert, label);
}

function deleteEntries(obj, label) {
    toDelete = [];
    if(label == "W")
        toDelete = obj2arrW(obj);
    else
        toDelete = obj2arr(obj);
    deleteEntriesArr(toDelete, label);
}

// 一次更新1000个数据，但是目前是同步的。。async关掉了，所以实际上没有加快加载速度。。。
function initList() {
    // TODO: 初始化listW
    var objB = [];
    var objS = [];
    var objW = [];
    var number = 1000;

    $.ajax({
        url: "users/getUserList",
        type: "post",
        dataType: "json",
        async: false,
        success: function (data) { // 返回的json是个对象数组，数组本身要有一个名字，假设就叫orders
            var obj = data;
            objW=objW.concat(obj);
        },
        error: function (req, stat, err) {
            alert("初始化列表失败！");

        }
    });


    for (var i = 0; i < 2; i++) {
        var submitJSON = [];
        var last = 1000;
        var fromIndex = 0;
        if (i == 0) {
            submitJSON = {
                buyOrSell: "0",
                from: fromIndex,
                num: number
            };
        }
        if (i == 1) {
            submitJSON = {
                buyOrSell: "1",
                from: fromIndex,
                num: number
            };
        }
        while (last == 1000) {
            $.ajax({
                url: "users/getList",
                type: "post",
                data: submitJSON,
                dataType: "json",
                async: false,
                success: function (data) { // 返回的json是个对象数组，数组本身要有一个名字，假设就叫orders
                    console.log(data);
                    var obj = data;
                    last = data.length;
                    fromIndex += number;
                    submitJSON["from"] = fromIndex;
                    if (obj[0].buyOrSell == "0") {
                        objB=objB.concat(obj);
                    } else {
                        objS=objS.concat(obj);
                    }
                },
                error: function (req, stat, err) {
                    alert("初始化列表失败！");
                    last = 0;
                }
            });
        }
    }
    listB = [];
    listS = [];
    listW = [];
    insertEntries(objB,"B");
    insertEntries(objW,"W");
    insertEntries(objS,"S");
    displayUpdateAll();
}

// 把从后台获得的挂单信息的JSON对象数组，转换成数字数组，顺序依次为[单价、手数、挂单ID]。
// TODO: 注意listW需要更多的列，所以这个函数不能重用，要再写一个
function obj2arr(objArr){ 
    var result=[];
    for(var i=0;i<objArr.length;i++){
        t = objArr[i];
        result.push([t.price, t.orderNum, t.orderID]);
    }
    return result;
}

function obj2arrW(objArr){
    var result=[];
    for(var i=0;i<objArr.length;i++){
        t = objArr[i];
        if(t.buyOrSell == "0")
            result.push([0,t.price, t.orderNum, t.orderID]);
        else
            result.push([1,t.price, t.orderNum, t.orderID]);
    }
    return result;
}



function waitTime(){
    var myDate = new Date();
    var day = myDate.getDay();
    var hour = myDate.getHours();
    var minute = myDate.getMinutes();
    // if(day == 0 || day == 6 || hour <= 8 || (hour == 9 && minute < 30)|| (hour == 11 && minute > 30)|| hour == 12 || hour >= 15){
    //     setTimeout(waitTime,5000);
    // }
    // else{
        initList();
        setTimeout(waitTime,5000);
    //}
}