var mysql = require('mysql');

var pool = mysql.createPool({
      host : 'tdsql-219vguff.sh.cdb.myqcloud.com',
      user : 'group5',
      password :'group5..',
      database:'stockg5',
      port : 23
  });
//可以监听connection事件，并设置session值
pool.on('connnection',function(connection){
  console.log("pool on");
  connection.query('SET SESSION auto_increment_increment=1')
});

function UserStock(userstock){
  this.account = userstock.account;
  this.stockCode = userstock.stockCode;
  this.amount = userstock.amount;
  this.updateTime = userstock.updateTime;
}

UserStock.prototype.userstockInfo = function(callback){
 var userstock = {
    account : this.account,
    stockCode : this.stockCode,
    amount : this.amount,
    updateTime : this.updateTime
  };
	console.log("username: " + userstock.account);
  var SELECT_USERSTOCK ="SELECT * FROM userstocks WHERE account = ?";
  pool.getConnection(function(err,connection){
    connection.query(SELECT_USERSTOCK,[userstock.account],function(err,result){
      if (err) {
        console.log("SELECT_USERSTOCK Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
}

UserStock.prototype.userrecordInfo = function(callback){
  var userstock = {
    account : this.account,
    stockCode : this.stockCode,
    amount : this.amount,
    updateTime : this.updateTime
  };
  console.log("username: "+userstock.account);
  var SELECT_USERRECORD = "SELECT * FROM traderecords WHERE code in (SELECT stockCode FROM userstocks WHERE account = ?)";
  pool.getConnection(function(err,connection){
    connection.query(SELECT_USERRECORD,[userstock.account],function(err,result){
      if(err){
        console.log("SELECT_USERRECORD Error: "+err.message);
        return;
      }
      connection.release();
      callback(err,result);
    })
  });
}
module.exports = UserStock;
