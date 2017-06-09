/*Author: Zihan Zhao of A1
 Modified: Initial status changed to "OpenApply 6/1/2017"*/
var mysql = require('mysql');


var pool = mysql.createPool({
      host : 'tdsql-219vguff.sh.cdb.myqcloud.com',
      user : 'group1',
      password :'group1..',
      database:'stockg1',
      port : 23
  });
  
//可以监听connection事件，并设置session值
pool.on('connnection',function(connection){
  console.log("pool on");
  connection.query('SET SESSION auto_increment_increment=1')
});

function User(user){
  this.username = user.username;
  this.password = user.password;
  this.type = user.type;
  this.status = user.status;
  this.id_card = user.id_card;
  this.name = user.name;
  this.gender = user.gender;
  this.phone = user.phone;
  this.email = user.email;
  this.address = user.address;
  this.occupation = user.occupation;
  this.education = user.education;
  this.workplace = user.workplace;
  this.agent_id = user.agent_id;
  this.business_license = user.business_license;
  this.manager_name = user.manager_name;
  this.manager_id_card = user.manager_id_card;
  this.manager_phone = user.manager_phone;
}

User.prototype.userSave = function save(callback){
  var user = {
    username : this.username,
    password : this.password,
    type : this.type,
    status : "OpenApply",
    id_card : this.id_card,
    name : this.name,
    gender : this.gender,
    phone : this.phone,
    email : this.email,
    address : this.address,
    occupation : this.occupation,
    education : this.education,
    workplace : this.workplace,
    agent_id : this.agent_id,
    business_license : this.business_license,
    manager_name : this.manager_name,
    manager_id_card : this.manager_id_card,
    manager_phone : this.manager_phone
  };
  var INSERT_USER= "INSERT INTO useraccount (USERID,usertype,userstatus,USERNAME,password,id_card,	name,gender,phone,email,address,occupation,education,workplace,	agent_id,business_license,manager_name,manager_id_card,manager_phone) VALUES (0,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  pool.getConnection(function(err,connection){
    connection.query(INSERT_USER,[user.type,user.status,user.username,user.password,user.id_card,user.name,user.gender,user.phone,user.email,user.address,user.occupation,user.education,user.workplace,user.agent_id,user.business_license,user.manager_name,user.manager_id_card,user.manager_phone],function(err,result){
      if(err){
        console.log("INSERT_USER Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
};

//根据用户名得到用户数量
User.prototype.userNum = function(username, callback) {
  pool.getConnection(function(err,connection){
    console.log("getConnection");
    console.log("getUserNumByName");
    var SELECT_NUM = "SELECT COUNT(1) AS num FROM useraccount WHERE USERNAME = ?";
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

User.prototype.updateInfo  =function(callback){
	var user = {
    username : this.username,
    password : this.password,
    type : this.type,
    status : this.status,
    id_card : this.id_card,
    name : this.name,
    gender : this.gender,
    phone : this.phone,
    email : this.email,
    address : this.address,
    occupation : this.occupation,
    education : this.education,
    workplace : this.workplace,
    agent_id : this.agent_id,
    business_license : this.business_license,
    manager_name : this.manager_name,
    manager_id_card : this.manager_id_card,
    manager_phone : this.manager_phone
  };
  
  var UPDATE_INFO =
  "UPDATE useraccount SET NAME = ?, GENDER = ?, PHONE = ?, EMAIL = ?, ADDRESS = ?, OCCUPATION = ?, EDUCATION = ?,WORKPLACE = ?, BUSINESS_LICENSE = ?,   MANAGER_NAME = ?, MANAGER_ID_CARD = ?, MANAGER_PHONE = ? WHERE USERNAME = ?";
  
  console.log("username: " + this.username);
  console.log("name: " + this.name);
  console.log("phone: " + this.phone);
  pool.getConnection(function(err,connection){
    connection.query(UPDATE_INFO,
	[user.name, user.gender, user.phone, user.email, 
	user.address, user.occupation, user.education, user.workplace, 
	user.business_license, user.manager_name,
	user.manager_id_card, user.manager_phone,user.username], function(err,result){
      if (err) {
        console.log("UPDATE_INFO Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
}

User.prototype.userInfo = function(callback){
 var user = {
    username : this.username,
    password : this.password,
    type : this.type,
    status : this.status,
    id_card : this.id_card,
    name : this.name,
    gender : this.gender,
    phone : this.phone,
    email : this.email,
    address : this.address,
    occupation : this.occupation,
    education : this.education,
    workplace : this.workplace,
    agent_id : this.agent_id,
    business_license : this.business_license,
    manager_name : this.manager_name,
    manager_id_card : this.manager_id_card,
    manager_phone : this.manager_phone
  };
 
  var SELECT_LOGIN ="SELECT * FROM useraccount WHERE USERNAME = ?";
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

User.prototype.updatePassword = function(newpassword,callback){
	var user = {
    username : this.username,
    password : newpassword};
  
  var UPDATE_INFO =
  "UPDATE useraccount SET PASSWORD = ? WHERE USERNAME = ?";
  
  console.log("username: " + this.username);
  console.log("oldpassword: " + this.password);
  console.log("newpassword: " + newpassword);
  
  pool.getConnection(function(err,connection){
    connection.query(UPDATE_INFO,
	[user.password, user.username], function(err,result){
      if (err) {
        console.log("UPDATE_INFO Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
}

User.prototype.CloseApply = function(callback){
	var user = {
    username : this.username};
  
  var UPDATE_INFO =
  "UPDATE useraccount SET userstatus = 'Close' WHERE USERNAME = ?";
  
  console.log("username: " + this.username);
  
  pool.getConnection(function(err,connection){
    connection.query(UPDATE_INFO,
	[user.username], function(err,result){
      if (err) {
        console.log("UPDATE_INFO Error: " + err.message);
        return;
      }
      connection.release();
      callback(err,result);
    });
  });
}

module.exports = User;
