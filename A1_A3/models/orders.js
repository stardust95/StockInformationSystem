var mysql = require('mysql');

//创建连接池 createPool(Object)
// Object和createConnection参数相同。
/*var pool = mysql.createPool({
      host : '112.74.124.145',
      user : 'group1',
      password :'group1',
      database:'stockG1',
      port : 3306
  });*/
var pool = mysql.createPool({
      host : 'tdsql-219vguff.sh.cdb.myqcloud.com',
      user : 'group4',
      password :'group4..',
      database:'stockg4',
      port : 23
  });
//可以监听connection事件，并设置session值
pool.on('connnection',function(connection){
  console.log("pool on");
  connection.query('SET SESSION auto_increment_increment=1')
});

function Orders(orders){
  this.userAccount = orders.userAccount;
  this.orderID = orders.orderID;
  this.stockID = orders.stockID;
  this.time = orders.time;
  this.buyOrSell = orders.buyOrSell;
  this.orderNum = orders.orderNum;
  this.price = orders.price;
}

Orders.prototype.ordersInfo = function(callback){
 var orders = {
    userAccount : this.userAccount,
    orderID : this.orderID,
    stockID : this.stockID,
    time : this.time,
    price : this.price,
    buyOrSell : this.buyOrSell,
    orderNum : this.orderNum
  };
 
  var SELECT_ORDERS ="SELECT * FROM orders WHERE userAccount = ?";
  pool.getConnection(function(err,connection){
    connection.query(SELECT_ORDERS,[orders.userAccount],function(err,result){
      if (err) {
        console.log("SELECT_ORDERS Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
}
module.exports = Orders;
