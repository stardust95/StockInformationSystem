var mysql = require('mysql');

var pool = mysql.createPool({
      host : 'tdsql-219vguff.sh.cdb.myqcloud.com',
      user : 'group1',
      password :'group1..',
      database:'stockg1',
      port : 23
  });
  
//���Լ���connection�¼���������sessionֵ
pool.on('connnection',function(connection){
  console.log("pool on");
  connection.query('SET SESSION auto_increment_increment=1')
});

function Admin(admin){
  this.username = admin.username;
  this.password = admin.password;
  this.idcard 	= admin.idcard;
  this.phone 	= admin.phone;
}

//�����û����õ��û�����
Admin.prototype.userNum = function(username, callback) {
  pool.getConnection(function(err,connection){
    console.log("getConnection");
    console.log("getUserNumByName");
    var SELECT_NUM = "SELECT COUNT(1) AS num FROM admin WHERE USERNAME = ?";
    connection.query(SELECT_NUM, [username], function (err, result) {
      if (err) {
        console.log("SELECT_NUM Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
};

Admin.prototype.userInfo = function(callback){
 var user = {
    username : this.username,
    password : this.password,
	idcard 	 : this.idcard,
	phone    : this.phone
  };
 
  var SELECT_LOGIN ="SELECT * FROM admin WHERE USERNAME = ?";
  pool.getConnection(function(err,connection){
    connection.query(SELECT_LOGIN,[user.username],function(err,result){
      if (err) {
        console.log("SELECT_LOGIN Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
}
module.exports = Admin;
