var mysql = require('mysql')

var config = {
    host: "112.74.124.145",
    user: "group5",
    password: "group5",
    port: "3306",
    database: "stockG5"
};

var pool = mysql.createPool(config)

class IndexData{
    constructor() {
    }

    static getConnection(){
        return pool
    }

    static getIndexInfor(code, callback) {
        var conn = IndexData.getConnection()
        conn.query("SELECT * FROM indexList WHERE code = " + code, callback)
    }
}

module.exports = IndexData