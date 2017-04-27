/**
 * Created by stardust on 2017/4/27.
 */

var mysql = require('mysql')

var config = {
    host: "112.74.124.145",
    user: "group5",
    password: "group5",
    port: "3306",
    database: "stockG5"
};

var pool = mysql.createPool(config)

function getConnection() {
    return pool
}

module.exports = getConnection