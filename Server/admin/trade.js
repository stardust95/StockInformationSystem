var mysql = require('mysql');
var database = require('./database');
var sql = require('./sqlmapping');
var admin = require('./admin');

var backend = mysql.createPool(database.backend);
var group5 = mysql.createPool(database.group5);

function match(param) {
                console.log("match");
                backend.getConnection(function (err, connection) {
                    if (err) {
                        console.log('connection err');
                        return;
                    }
                    connection.query(sql.querySellOrder, [param.stockID, '1' , param.price], function (err, result) {
                        if (err) {
                            console.log('query err');
                            return;
                        }
                        if (result.length != 0) {
                            for (var i = 0; i < result.length; i++) {
                                var message = {};
                                if (result[i].orderNum > param.orderNum) {
                                    message.state = 1;
                                    message.orderNum = param.orderNum;
                                    message.buyer = param.userID;
                                    message.seller = result[i].userID;
                                    message.stockID = param.stockID;
                                    message.price = result[i].price;
                                    message.amount = message.price*message.orderNum*100;


                                    result[i].orderNum -= param.orderNum;
                                    param.orderNum = 0;
                                    connection.query(sql.updateOrder, [result[i].orderNum, result[i].orderID], function (err, result) {
                                        if (err) {
                                            console.log('query err');
                                            return;
                                        }
                                        if (result.affectedRows > 0) {
                                            console.log('update success');
                                        }
                                        else {
                                            console.log('update err');
                                        }
                                    });
                                }
                                else {
                                    message.state = 1;
                                    message.orderNum = result[i].orderNum;
                                    message.buyer = param.userID;
                                    message.seller = result[i].userID;
                                    message.stockID = param.stockID;
                                    message.price = result[i].price;
                                    message.amount = message.price*message.orderNum*100;

                                    param.orderNum -= result[i].orderNum;
                                    result[i].orderNum = 0;
                                    connection.query(sql.deleteOrder, result[i].orderID, function (err, result) {
                                        if (err) {
                                            console.log('query err');
                                            return;
                                        }
                                        if (result.affectedRows > 0) {
                                            console.log('delete success');
                                        }
                                        else {
                                            console.log('delete err');
                                        }
                                    });
                                }
                                //买家fund解冻
                                //卖家stock解冻
                                //买家fund减少
                                //卖家fund增加
                                //买家stock增加
                                //卖家stock减少

                                    fund解冻操作
                                    err返回
                                    var submitJSON = {username:message.seller,money:message.orderNum*message.price*100};
                                    var request = require('request');

                                    request.post(
                                        'http://112.74.124.145:3001/withdrawForBack',
                                        { json:submitJSON},
                                        function (error, response, body) {
                                            if (!error && response.statusCode == 200) {
                                                console.log(body);
                                               if(body.success == 'yes'){
                                    
                                                console.log("资金操作成功");
                                              }else{
                                                  console.log("资金操作出错");
                                              }
                                            }
                                            else{
                                              console.log("股票操作失败");
                                            }
                                        }
                                    );
                                    
                                  
                                    
                                    //stock增加操作
                                    //err返回
                                    var submitJSON = {type:1,username:message.buyer,id:message.stockID,number:message.orderNum};
                                   

                                    request.post(
                                        'http://112.74.124.145:3002/users/trade',
                                        { json: submitJSON},
                                        function (error, response, body) {
                                            if (!error && response.statusCode == 200) {
                                                console.log(body)
                                               if(body.success == 1){
                                                  console.log("股票操作成功");
                                                }else{
                                                    console.log("股票操作失败");
                                                }
                                            }else{
                                               console.log("股票操作失败");
                                            }
                                        }
                                    );
                                   



                                //连接交易记录数据库,存储记录

                                group5.getConnection(function (err, connection5) {
                                    if (err) {
                                        console.log('connection err');
                                        return;
                                    }
                                    connection5.query(sql.queryQuote,[message.stockID],function (err, result) {
                                        if (err) {
                                            console.log('query err');
                                            return;
                                        }
                                        if (result.length != 0 ) {
                                            var curtime = new Date();
                                            message.date = curtime.toLocaleDateString();
                                            message.time = curtime.toLocaleTimeString();
                                            message.preprice =  result[0].price;
                                            message.high = result[0].high;
                                            message.low = result[0].low;
                                            message.high = Math.max(message.high,message.price);
                                            message.low = Math.min(message.low,message.price);
                                            message.change = message.price - message.preprice;
                                            message.allvolume = parseInt(result[0].volume) + message.orderNum;
                                            message.allamount = parseFloat(result[0].amount) + message.amount;
                                            if(message.change >= 0)
                                                message.type = "买盘";
                                            else
                                                message.type = "卖盘";
                                            console.log(message);
                                            connection5.query(sql.createTradeRecord,[message.stockID,message.date,message.time,message.price,message.change,
                                                message.orderNum,message.amount, message.type,message.buyer,message.seller],function (err, result) {
                                                if (err) {
                                                    console.log('query err3');
                                                    return;
                                                }
                                                if (result.affectedRows > 0) {
                                                    console.log('insert success');
                                                }
                                                else {
                                                    console.log('insert err');
                                                }
                                            });

                                            connection.query(sql.queryBuyOrder5,function (err, buy5) {
                                                if (err) {
                                                    console.log('query err');
                                                    return;
                                                }
                                                if(buy5.length != 5){
                                                    buy5.push({price:0, orderNum:0});
                                                    buy5.push({price:0, orderNum:0});
                                                    buy5.push({price:0, orderNum:0});
                                                    buy5.push({price:0, orderNum:0});
                                                    buy5.push({price:0, orderNum:0});
                                                }

                                                connection.query(sql.querySellOrder5,function (err, sell5) {
                                                    if (err) {
                                                        console.log('query err');
                                                        return;
                                                    }
                                                    if(sell5.length != 5){
                                                        sell5.push({price:0, orderNum:0});
                                                        sell5.push({price:0, orderNum:0});
                                                        sell5.push({price:0, orderNum:0});
                                                        sell5.push({price:0, orderNum:0});
                                                        sell5.push({price:0, orderNum:0});
                                                    }
                                                    connection5.query(sql.changeQuote,[message.price,message.high,message.low,message.time,message.date,
                                                        message.allvolume, message.allamount,buy5[0].price,sell5[0].price,
                                                        buy5[0].price,buy5[0].orderNum,buy5[1].price,buy5[1].orderNum,buy5[2].price,buy5[2].orderNum,buy5[3].price,buy5[3].orderNum,buy5[4].price,buy5[4].orderNum,
                                                        sell5[0].price,sell5[0].orderNum,sell5[1].price,sell5[1].orderNum,sell5[2].price,sell5[2].orderNum,sell5[3].price,sell5[3].orderNum,sell5[4].price,sell5[4].orderNum,
                                                        message.stockID],function (err, result) {
                                                        if (err) {
                                                            console.log('query err');
                                                            return;
                                                        }
                                                        if (result.affectedRows > 0) {
                                                            console.log('change success');
                                                        }
                                                        else {
                                                            console.log('change err');
                                                        }
                                                    });

                                                });

                                            });



                                        }
                                        else {
                                            console.log('query null');
                                        }

                                    });
                                    connection5.release();

                                });

                                if (param.orderNum === 0) {
                                    connection.query(sql.deleteOrder, param.orderID, function (err, result) {
                                        if (err) {
                                            console.log('query err');
                                            return;
                                        }
                                        if (result.affectedRows > 0) {
                                            console.log('delete success');
                                        }
                                        else {
                                            console.log('delete err');
                                        }
                                    });
                                    break;
                                }else{
                                    connection.query(sql.updateOrder, [param.orderNum, param.orderID], function (err, result) {
                                        if (err) {
                                            console.log('query err');
                                            return;
                                        }
                                        if (result.affectedRows > 0) {
                                            console.log('update success');
                                        }
                                        else {
                                            console.log('update err');
                                        }
                                    });
                                }
                            }
                            connection.release();
                        }
                        else {
                            console.log('query null');
                            connection.release();
                        }
                    });
                });
}

module.exports = {
    trade: function () {
        console.log("trade");
        backend.getConnection(function (err, connection) {
            if (err) {
                console.log('connection err');
                return;
            }
            connection.query(sql.getStockList, function (err, stockList) {
                if (err) {
                    console.log('query err');
                    return;
                }
                if (stockList.length != 0 ) {
                    var i;
                    for (i = 0; i < stockList.length; i++) {
                        connection.query(sql.queryOneBuyOrder, [stockList[i].stockID, '0'], function (err, result) {
                            if (err) {
                                console.log('query err');
                                return;
                            }
                            if (result.length != 0) {
                                match(result[0]);
                            }
                            else {
                                console.log('query null');
                            }
                        });
                    }
                }
                else {
                    console.log('query null');
                }
                connection.release();
            });
        });
    },
    callAuction: function () {
        backend.getConnection(function (err, connection) {
            if (err) {
                console.log('connection err');
                return;
            }
            connection.query(sql.getStockList, function (err, stockList) {
                if (err) {
                    console.log('query err');
                    return;
                }
                if (stockList.length != 0) {
                    var i;
                    for (i = 0; i < stockList.length; i++) {
                        var param = {};
                        param['stockID'] = stockList[i].stockID;
                        //最终价格
                        var resPrice = -1;
                        connection.query(sql.queryAllOrder, param.stockID, function (err, result) {
                            if (err) {
                                console.log('query err');
                                return;
                            }
                            if (result.length != 0) {

                                //升序卖单
                                var sellOrders = [];
                                //降序买单
                                var buyOrders = [];
                                for (var i = 0; i < result.length; i++) {

                                    if (result[i].buyOrSell === '0') {
                                        buyOrders.unshift(result[i]);
                                    }
                                    else {
                                        sellOrders.push(result[i]);
                                    }
                                }
                                var i = 0;
                                var j = 0;
                                while(j < sellOrders.length && i < buyOrders.length){
                                    if(buyOrders[i].price >= sellOrders[j].price){
                                        if(buyOrders[i].orderNum > sellOrders[j].orderNum){
                                            buyOrders[i].orderNum -= sellOrders[j].orderNum;
                                            resPrice = sellOrders[j].price;
                                            j++;
                                        }
                                        else if(buyOrders[i].price == sellOrders[j].price){
                                            resPrice = sellOrders[j].price;
                                            j++;
                                            i++
                                        }
                                        else{
                                            sellOrders[j].orderNum -= buyOrders[i].orderNum;
                                            resPrice = sellOrders[j].price;
                                            i++;
                                        }
                                    }
                                    else{
                                        break;
                                    }

                                }

                            }
                            console.log(resPrice);
                            //开始交易
                            group5.getConnection(function (err, connection5) {
                                if (err) {
                                    console.log('connection err');
                                    return;
                                }
                                connection5.query(sql.getYesterday,[param.stockID],function (err, result) {
                                    if (err) {
                                        console.log('query err');
                                        return;
                                    }
                                    if(result){

                                        if(resPrice != -1){
                                            admin.open = resPrice;
                                            connection5.query(sql.updateOpen,[resPrice,result[0].price,param.stockID],function (err, result) {
                                                if (err) {
                                                    console.log('query err');
                                                    return;
                                                }
                                                if(result.affectedRows > 0){
                                                    console.log('update sucessful');
                                                }else{
                                                    console.log('update err');
                                                }
                                            });
                                        }else{
                                            admin.open = result[0].price;
                                            connection5.query(sql.updateOpen,[result[0].price,result[0].price,param.stockID],function (err, result) {
                                                if (err) {
                                                    console.log('query err');
                                                    return;
                                                }
                                                if(result.affectedRows > 0){
                                                    console.log('update sucessful');
                                                }else{
                                                    console.log('update err');
                                                }
                                            });
                                        }

                                    }else{
                                        console.log('query err');
                                    }

                                });


                                connection5.release();
                            });
                            connection.query(sql.queryBuyOrder, [param.stockID, '0', resPrice], function (err, buyOrders) {
                                if (err) {
                                    console.log('query err');
                                    return;
                                }
                                if (buyOrders.length != 0) {
                                    connection.query(sql.querySellOrder, [param.stockID, '1', resPrice], function (err, sellOrders) {
                                        if (err) {
                                            console.log('query err');
                                            return;
                                        }
                                        if (sellOrders.length != 0) {
                                            var i = 0, j = 0;
                                            while (i < buyOrders.length && j < sellOrders.length) {
                                                var message = {};
                                                if (buyOrders[i].orderNum > sellOrders[j].orderNum) {
                                                    message.state = 1;
                                                    message.orderNum = sellOrders[j].orderNum;
                                                    message.buyer = buyOrders[i].userID;
                                                    message.seller = sellOrders[j].userID;
                                                    message.stockID = sellOrders[j].stockID;
                                                    message.price = resPrice;
                                                    message.amount = message.price*message.orderNum*100;

                                                    buyOrders[i].orderNum -= sellOrders[j].orderNum;
                                                    sellOrders[j].orderNum = 0;
                                                    connection.query(sql.updateOrder, [buyOrders[i].orderNum, buyOrders[i].orderID], function (err, result) {
                                                        if (err) {
                                                            console.log('query err');
                                                            return;
                                                        }
                                                        if (result.affectedRows > 0) {
                                                            console.log('update success');
                                                        }
                                                        else {
                                                            console.log('update err');
                                                        }
                                                    });
                                                    connection.query(sql.deleteOrder, sellOrders[j].orderID, function (err, result) {
                                                        if (err) {
                                                            console.log('query err');
                                                            return;
                                                        }
                                                        if (result.affectedRows > 0) {
                                                            console.log('delete success');
                                                        }
                                                        else {
                                                            console.log('delete err');
                                                        }
                                                    });
                                                    //买家fund解冻
                                                    //卖家stock解冻

                                                    //注意，以resPrice成交

                                                    //买家fund减少
                                                    //卖家fund增加
                                                    //买家stock增加
                                                    //卖家stock减少
                                                    var submitJSON = {username:message.seller,money:message.orderNum*message.price*100};
                                                    var request = require('request');
                                                     request.post(
                                                        'http://112.74.124.145:3001/withdrawForBack',
                                                        { json:submitJSON},
                                                        function (error, response, body) {
                                                            if (!error && response.statusCode == 200) {
                                                                console.log(body);
                                                               if(body.success == 'yes'){

                                                                console.log("资金操作成功");
                                                              }else{
                                                                  console.log("资金操作出错");
                                                              }
                                                            }
                                                            else{
                                                              console.log("股票操作失败");
                                                            }
                                                        }
                                                    );
                                                    
                                                    
                                                    //stock增加操作
                                                    //err返回
                                                    var submitJSON = {type:1,username:message.buyer,id:message.stockID,number:message.orderNum};
                                                    request.post(
                                                        'http://112.74.124.145:3002/users/trade',
                                                        { json: submitJSON},
                                                        function (error, response, body) {
                                                            if (!error && response.statusCode == 200) {
                                                                console.log(body)
                                                               if(body.success == 1){
                                                                  console.log("股票操作成功");
                                                                }else{
                                                                    console.log("股票操作失败");
                                                                }
                                                            }else{
                                                               console.log("股票操作失败");
                                                            }
                                                        }
                                                    );

                                                    //交易数据库
                                                    group5.getConnection(function (err, connection5) {
                                                        if (err) {
                                                            console.log('connection err');
                                                            return;
                                                        }
                                                        connection5.query(sql.queryQuote,[message.stockID],function (err, result) {
                                                            if (err) {
                                                                console.log('query err');
                                                                return;
                                                            }
                                                            if (result.length != 0 ) {
                                                                var curtime = new Date();
                                                                message.date = curtime.toLocaleDateString();
                                                                message.time = curtime.toLocaleTimeString();
                                                                message.preprice =  resPrice;
                                                                message.high = resPrice;
                                                                message.low = resPrice;
                                                                message.high = Math.max(message.high,message.price);
                                                                message.low = Math.min(message.low,message.price);
                                                                message.change = message.price - message.preprice;
                                                                message.allvolume = parseInt(result[0].volume) + message.orderNum;
                                                                message.allamount = parseFloat(result[0].amount) + message.amount;
                                                                if(message.change >= 0)
                                                                    message.type = "买盘";
                                                                else
                                                                    message.type = "卖盘";
                                                                console.log(message);
                                                                connection5.query(sql.createTradeRecord,[message.stockID,message.date,message.time,message.price,message.change,
                                                                    message.orderNum,message.amount, message.type,message.buyer,message.seller],function (err, result) {
                                                                    if (err) {
                                                                        console.log('query err3');
                                                                        return;
                                                                    }
                                                                    if (result.affectedRows > 0) {
                                                                        console.log('insert success');
                                                                    }
                                                                    else {
                                                                        console.log('insert err');
                                                                    }
                                                                });

                                                                connection.query(sql.queryBuyOrder5,function (err, buy5) {
                                                                    if (err) {
                                                                        console.log('query err');
                                                                        return;
                                                                    }
                                                                    if(buy5.length != 5){
                                                                        buy5.push({price:0, orderNum:0});
                                                                        buy5.push({price:0, orderNum:0});
                                                                        buy5.push({price:0, orderNum:0});
                                                                        buy5.push({price:0, orderNum:0});
                                                                        buy5.push({price:0, orderNum:0});
                                                                    }

                                                                    connection.query(sql.querySellOrder5,function (err, sell5) {
                                                                        if (err) {
                                                                            console.log('query err');
                                                                            return;
                                                                        }
                                                                        if(sell5.length != 5){
                                                                            sell5.push({price:0, orderNum:0});
                                                                            sell5.push({price:0, orderNum:0});
                                                                            sell5.push({price:0, orderNum:0});
                                                                            sell5.push({price:0, orderNum:0});
                                                                            sell5.push({price:0, orderNum:0});
                                                                        }
                                                                        connection5.query(sql.changeQuote,[message.price,message.high,message.low,message.time,message.date,
                                                                            message.allvolume, message.allamount,buy5[0].price,sell5[0].price,
                                                                            buy5[0].price,buy5[0].orderNum,buy5[1].price,buy5[1].orderNum,buy5[2].price,buy5[2].orderNum,buy5[3].price,buy5[3].orderNum,buy5[4].price,buy5[4].orderNum,
                                                                            sell5[0].price,sell5[0].orderNum,sell5[1].price,sell5[1].orderNum,sell5[2].price,sell5[2].orderNum,sell5[3].price,sell5[3].orderNum,sell5[4].price,sell5[4].orderNum,
                                                                            message.stockID],function (err, result) {
                                                                            if (err) {
                                                                                console.log('query err');
                                                                                return;
                                                                            }
                                                                            if (result.affectedRows > 0) {
                                                                                console.log('change success');
                                                                            }
                                                                            else {
                                                                                console.log('change err');
                                                                            }
                                                                        });

                                                                    });

                                                                });



                                                            }
                                                            else {
                                                                console.log('query null');
                                                            }

                                                        });
                                                        connection5.release();

                                                    });

                                                    j++;
                                                }
                                                else {
                                                    message.state = 1;
                                                    message.orderNum = buyOrders[i].orderNum;
                                                    message.buyer = buyOrders[i].userID;
                                                    message.seller = sellOrders[j].userID;
                                                    message.stockID = sellOrders[j].stockID;
                                                    message.price = resPrice;
                                                    message.amount = message.price*message.orderNum*100;

                                                    sellOrders[j].orderNum -= buyOrders[i].orderNum;
                                                    buyOrders[i].orderNum = 0;
                                                    connection.query(sql.updateOrder, [sellOrders[j].orderNum, sellOrders[j].orderID], function (err, result) {
                                                        if (err) {
                                                            console.log('query err');
                                                            return;
                                                        }
                                                        if (result.affectedRows > 0) {
                                                            console.log('update success');
                                                        }
                                                        else {
                                                            console.log('update err');
                                                        }
                                                    });
                                                    connection.query(sql.deleteOrder, buyOrders[i].orderID, function (err, result) {
                                                        if (err) {
                                                            console.log('query err');
                                                            return;
                                                        }
                                                        if (result.affectedRows > 0) {
                                                            console.log('delete success');
                                                        }
                                                        else {
                                                            console.log('delete err');
                                                        }
                                                    });
                                                    connection.query(sql.clean,[param.stockID],function (err, result) {
                                                        if (err) {
                                                            console.log('query err');
                                                            return;
                                                        }
                                                        if(result.affectedRows > 0){
                                                            console.log('clean sucessful');
                                                        }else{
                                                            console.log('clean err');
                                                        }

                                                    });
                                                    //买家fund解冻
                                                    //卖家stock解冻

                                                    //注意，以resPrice成交

                                                    //买家fund减少
                                                    //卖家fund增加
                                                    //买家stock增加
                                                    //卖家stock减少

                                                    //交易数据库
                                                    group5.getConnection(function (err, connection5) {
                                                        if (err) {
                                                            console.log('connection err');
                                                            return;
                                                        }
                                                        connection5.query(sql.queryQuote,[message.stockID],function (err, result) {
                                                            if (err) {
                                                                console.log('query err');
                                                                return;
                                                            }
                                                            if (result.length != 0 ) {
                                                                var curtime = new Date();
                                                                message.date = curtime.toLocaleDateString();
                                                                message.time = curtime.toLocaleTimeString();
                                                                message.preprice =  resPrice;
                                                                message.high = resPrice;
                                                                message.low = resPrice;
                                                                message.high = Math.max(message.high,message.price);
                                                                message.high = Math.max(message.low,message.price);
                                                                message.change = message.price - message.preprice;
                                                                message.allvolume = parseInt(result[0].volume) + message.orderNum;
                                                                message.allamount = parseFloat(result[0].amount) + message.amount;
                                                                if(message.change >= 0)
                                                                    message.type = "买盘";
                                                                else
                                                                    message.type = "卖盘";
                                                                console.log(message);
                                                                connection5.query(sql.createTradeRecord,[message.stockID,message.date,message.time,message.price,message.change,
                                                                    message.orderNum,message.amount, message.type,message.buyer,message.seller],function (err, result) {
                                                                    if (err) {
                                                                        console.log('query err3');
                                                                        return;
                                                                    }
                                                                    if (result.affectedRows > 0) {
                                                                        console.log('insert success');
                                                                    }
                                                                    else {
                                                                        console.log('insert err');
                                                                    }
                                                                });

                                                                connection.query(sql.queryBuyOrder5,function (err, buy5) {
                                                                    if (err) {
                                                                        console.log('query err');
                                                                        return;
                                                                    }
                                                                    if(buy5.length != 5){
                                                                        buy5.push({price:0, orderNum:0});
                                                                        buy5.push({price:0, orderNum:0});
                                                                        buy5.push({price:0, orderNum:0});
                                                                        buy5.push({price:0, orderNum:0});
                                                                        buy5.push({price:0, orderNum:0});
                                                                    }

                                                                    connection.query(sql.querySellOrder5,function (err, sell5) {
                                                                        if (err) {
                                                                            console.log('query err');
                                                                            return;
                                                                        }
                                                                        if(sell5.length != 5){
                                                                            sell5.push({price:0, orderNum:0});
                                                                            sell5.push({price:0, orderNum:0});
                                                                            sell5.push({price:0, orderNum:0});
                                                                            sell5.push({price:0, orderNum:0});
                                                                            sell5.push({price:0, orderNum:0});
                                                                        }
                                                                        connection5.query(sql.changeQuote,[message.price,message.high,message.low,message.time,message.date,
                                                                            message.allvolume, message.allamount,buy5[0].price,sell5[0].price,
                                                                            buy5[0].price,buy5[0].orderNum,buy5[1].price,buy5[1].orderNum,buy5[2].price,buy5[2].orderNum,buy5[3].price,buy5[3].orderNum,buy5[4].price,buy5[4].orderNum,
                                                                            sell5[0].price,sell5[0].orderNum,buy5[1].price,buy5[1].orderNum,buy5[2].price,buy5[2].orderNum,buy5[3].price,buy5[3].orderNum,buy5[4].price,buy5[4].orderNum,
                                                                            message.stockID],function (err, result) {
                                                                            if (err) {
                                                                                console.log('query err');
                                                                                return;
                                                                            }
                                                                            if (result.affectedRows > 0) {
                                                                                console.log('change success');
                                                                            }
                                                                            else {
                                                                                console.log('change err');
                                                                            }
                                                                        });

                                                                    });

                                                                });



                                                            }
                                                            else {
                                                                console.log('query null');
                                                            }

                                                        });
                                                        connection5.release();

                                                    });
                                                    i++;
                                                }
                                            }
                                        }
                                        else {
                                            console.log('query null');
                                        }
                                        connection.release();
                                    });
                                }
                                else {
                                    console.log('query null');
                                }
                            });
                        });

                        // backend.getConnection(function (err, connection) {
                        //     if (err) {
                        //         console.log('connection err');
                        //         return;
                        //     }
                        //     connection.query(sql.clean,[param.stockID],function (err, result) {
                        //         if (err) {
                        //             console.log('query err');
                        //             return;
                        //         }
                        //         if(result.affectedRows > 0){
                        //             console.log('clean sucessful');
                        //         }else{
                        //             console.log('clean err');
                        //         }
                        //
                        //     });
                        //     connection5.release();
                        // });
                    }
                }
                else {
                    console.log('query null');
                }
            });
        });
    }
};
