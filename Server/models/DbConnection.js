/**
 * Created by stardust on 2017/4/27.
 */

var mysql = require('mysql');

var config = {
    host: "tdsql-219vguff.sh.cdb.myqcloud.com",
    user: "group5",
    password: "group5..",
    port: "23",
    database: "stockG5"
};

var pool = mysql.createPool(config);

function getConnection() {
    return pool
}

module.exports = getConnection;