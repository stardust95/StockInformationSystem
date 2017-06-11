var mysql = require('mysql');
var database = require('./database');
var sql = require('./sqlmapping');

var backend = mysql.createPool(database.backend);
var group5 = mysql.createPool(database.group5);

function fund_query(account) {

    return 10000;
}

function stock_query(id) {
    return 10000;
}

function createOrder(res, param) {
    backend.getConnection(function (err, connection) {
        if (err) {
            res.json({
                status: '0',
                info: '数据库连接错误'
            });
            return;
        }
        if (param.buyOrSell === '0') {
            //fund冻结操作
            //err返回
            var submitJSON = {money: Number(param.price)*Number(param.orderNum)*100,username:param.userID};

            var request = require('request');

            request.post(
                'http://112.74.124.145:3001/withdrawForBack',
                { json:submitJSON },
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);
                        if(body.success == 'yes'){
                            connection.query(sql.createOrder, [param.stockID, param.buyOrSell, "1", param.orderNum, param.price, param.userID, 0], function (err, result) {
                                if (err) {
                                    res.json({
                                        status: '0',
                                        info: '后台挂单出错'
                                    });
                                    return;
                                }
                                res.json({
                                    status: '1',
                                    info: '挂单成功',
                                    data:{  orderNum: param.orderNum,
                                        price: param.price,
                                        orderID: result.insertId,
                                        buyOrSell: param.buyOrSell
                                    }
                                });
                            });
                        }else{
                            res.json({
                                status: '0',
                                info:body.error
                            });
                        }

                    }else{
                        res.json({
                            status: '0',
                            info:'挂单失败'
                        });
                    }

                }
            );
        }
        else {
            //stock冻结操作
            //err返回
            var submitJSON = {type:0,username:param.userID,id:param.stockID,number:Number(param.orderNum)};
            var request = require('request');

            request.post(
                '112.74.124.145:3002/users/trade',
                { json: submitJSON},
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if(body.success == 1){
                            connection.query(sql.createOrder, [param.stockID, param.buyOrSell, "1", param.orderNum, param.price, param.userID, 0], function (err, result) {
                                if (err) {
                                    res.json({
                                        status: '0',
                                        info: '后台挂单出错'
                                    });
                                    return;
                                }
                                res.json({
                                    status: '1',
                                    info: '挂单成功',
                                    data:{  orderNum: param.orderNum,
                                        price: param.price,
                                        orderID: result.insertId,
                                        buyOrSell: param.buyOrSell
                                    }
                                });
                            });
                        }else{
                            res.json({
                                status: '0',
                                info:'您的股票数量不足'
                            });
                        }
                    }else{
                        res.json({
                            status: '0',
                            info:'后台出错'
                        });

                        return;
                    }


                }
            );
        }
//         connection.query(sql.createOrder, [param.stockID, param.buyOrSell, "1", param.orderNum, param.price, param.userID, 0], function (err, result) {
//             if (err) {

//                 res.json({
//                     status: '0',
//                     info: '后台挂单出错'
//                 });
//                 return;
//             }
//             res.json({
//                 status: '1',
//                 info: '挂单成功',
//                 data:{  orderNum: param.orderNum,
//                         price: param.price,
//                         orderID: result.insertId,
//                         buyOrSell: param.buyOrSell
//                 }
//             });
//         });
        connection.release();
    });
}

module.exports = {
    checkOrder: function (req, res, next) {
        var param = req.body;
        param.userID = req.session.username;
        param.stockID = req.session.stockID;
        // var myDate = new Date();
        // var day = myDate.getDay();
        // var hour = myDate.getHours();
        // var minute = myDate.getMinutes();
        //
        // if(day == 0 || day == 6 || hour <= 8 || (hour == 9 && minute < 15)|| (hour == 11 && minute > 30)|| hour == 12 || hour >= 15){
        //     res.json({
        //         status: '0',
        //         info: '现在不是挂单时间'
        //     });
        //     return;
        // }
        //0买1卖
        console.log(param);

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
                    console.log('hahaha');
                    if(Number(param.price) > 1.1*result[0].open ){
                        res.json({
                            status: '0',
                            info: '价格超过今日涨停价'
                        });
                        return;
                    }else if(Number(param.price) < 0.9*result[0].open ){
                        res.json({
                            status: '0',
                            info: '价格小于今日跌停价'
                        });
                        return;
                    }else{
                        if (param.buyOrSell === '0') {
                            if (param.orderNum == '') {
                                res.json({
                                    status: '0',
                                    info: '手数不能为空'
                                });
                                return;
                            }
                            if (param.price == '') {
                                res.json({
                                    status: '0',
                                    info: '价格不能为空'
                                });
                                return;
                            }
                            if (param.userID == '') {
                                res.json({
                                    status: '0',
                                    info: '请先登录您的账号'
                                });
                                return;
                            }
                            //fund查询操作
                            //err返回
                            var fund = fund_query(param.userAccount);
                            if (fund) {
                                if (fund >= Number(param.price) * Number(param.orderNum)) {
                                    createOrder(res, param);
                                }
                                else {
                                    res.json({
                                        status: '0',
                                        info: '资金不足'
                                    });
                                }
                            }
                            else {
                                res.json({
                                    status: '0',
                                    info: '不存在该账号'
                                });
                            }
                        }
                        else if (param.buyOrSell === '1') {
                            if (param.stockID == '') {
                                res.json({
                                    status: '0',
                                    info: '不存在该股票'
                                });
                                return;
                            }
                            if (param.orderNum == '') {
                                res.json({
                                    status: '0',
                                    info: '手数不能为空'
                                });
                                return;
                            }
                            if (param.userID == '') {
                                res.json({
                                    status: '0',
                                    info: '请先登录您的账号'
                                });
                                return;
                            }
                            //stock查询操作
                            //err返回
                            var stock = stock_query(param.userID);
                            if (stock) {
                                if (stock >= Number(param.orderNum)) {
                                    createOrder(res, param);
                                }
                                else {
                                    res.json({
                                        status: '0',
                                        info: '您的股票数量不足'
                                    });
                                }
                            }
                            else {
                                res.json({
                                    status: '0',
                                    info: '不存在该用户'
                                });
                            }
                        }
                    }
                }else{
                    console.log('query err');
                }

            });


            connection5.release();
        });


    },
    getList: function (req, res, next) {
        var param = req.body;
        backend.getConnection(function (err, connection) {
            if(param.buyOrSell == '0'){
                connection.query(sql.getBuyList, [param.buyOrSell, parseInt(param.from), parseInt(param.num)], function (err, result) {
                    if (err) {
                        console.log('database connection error');
                        return;
                    }
                    res.json(result);
                    connection.release();
                });
            }else{
                connection.query(sql.getSellList, [param.buyOrSell, parseInt(param.from), parseInt(param.num)], function (err, result) {
                    if (err) {
                        console.log('database connection error');
                        return;
                    }
                    res.json(result);
                    connection.release();
                });
            }

        });
    },
    getUserList: function (req, res, next) {
        var param = req.body;
        param.userID = req.session.username;
        backend.getConnection(function (err, connection) {
            connection.query(sql.getUserList, [param.userID], function (err, result) {
                if (err) {
                    console.log('database connection error');
                    return;
                }
                console.log(result);
                res.json(result);
                connection.release();
            });
        });
    },
    deleteOrder :function (req, res, next) {
        var param = req.body;
        param.userID = req.session.username;
        param.stockID = req.session.stockID;

        backend.getConnection(function (err, connection) {
            connection.query(sql.queryOrder, [param.orderID], function (err, result) {
                if (err) {
                    res.json({
                        status: '0',
                        info: '撤单失败'
                    });
                    return;
                }
                if (result[0].buyOrSell === '0') {
                    //fund解冻操作
                    //err返回
                    var submitJSON = {money: result[0].orderNum * result[0].price * 100, username: param.userID};
                    var request = require('request');

                    request.post(
                        'http://112.74.124.145:3001/withdrawForBack',
                        {json: submitJSON},
                        function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log(body);
                                if (body.success == 'yes') {
                                    res.json({
                                        status: '1',
                                        info: '撤单成功',
                                        data: result
                                    });
                                    connection.query(sql.deleteOrder, [param.orderID], function (err, result) {
                                        if (err) {
                                            console.log('database connection error');
                                            return;
                                        }
                                    });
                                } else {
                                    res.json({
                                        status: '0',
                                        info: '撤单失败'
                                    });
                                }

                            } else {
                                res.json({
                                    status: '0',
                                    info: '撤单失败'
                                });
                            }
                        }
                    );

                }
                else {
                    //stock返回操作
                    //err返回
                    var submitJSON = {type: 1, id: param.stockID, number: result[0].orderNum, username: param.userID};
                    var request = require('request');

                    request.post(
                        '112.74.124.145:3002/users/trade',
                        {json: submitJSON},
                        function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log(body);
                                if (body.success == 1) {
                                    connection.query(sql.createOrder, [param.stockID, param.buyOrSell, "1", param.orderNum, param.price, param.userID, 0], function (err, result) {
                                        if (err) {
                                            res.json({
                                                status: '0',
                                                info: '撤单失败'
                                            });
                                            return;
                                        }
                                        res.json({
                                            status: '1',
                                            info: '撤单成功',
                                            data: result
                                        });
                                        connection.query(sql.deleteOrder, [param.orderID], function (err, result) {
                                            if (err) {
                                                console.log('database connection error');
                                                return;
                                            }
                                        });
                                    });
                                } else {
                                    res.json({
                                        status: '0',
                                        info: '撤单失败'
                                    });
                                }

                            } else {
                                res.json({
                                    status: '0',
                                    info: '撤单失败'
                                });
                            }
                        }
                    );


//                 res.json({
//                     status: '1',
//                     info: '撤单成功',
//                     data:result
//                 });
                }
            });

//             connection.query(sql.deleteOrder, [param.orderID], function (err, result) {
//                 if (err) {
//                     console.log('database connection error');
//                     return;
//                 }
//             });



            connection.release();
        });
        }

    };
