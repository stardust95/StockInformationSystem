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

function Record(record){
  this.code = record.code;
  this.date = record.date;
  this.time = record.time;
  this.price = record.price;
  this.change = record.change;
  this.volume = record.volume;
  this.amount = record.amount;
  this.type = record.type;
}

Record.prototype.recordInfo = function(callback){
 var record = {
    code : this.code,
    date : this.date,
    time : this.time,
    price : this.price,
    change : this.change,
    volume : this.volume,
    amount : this.amount,
    type : this.type
  };
 
  var SELECT_RECORD ="SELECT * FROM traderecords WHERE CODE = ?";
  pool.getConnection(function(err,connection){
    connection.query(SELECT_RECORD,[record.code],function(err,result){
      if (err) {
        console.log("SELECT_RECORD Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
}
module.exports = Record;
