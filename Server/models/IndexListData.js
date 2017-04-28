var mysql = require('mysql')

var config = {
    host: "112.74.124.145",
    user: "group5",
    password: "group5",
    port: "3306",
    database: "stockG5"
};

var pool = mysql.createPool(config)

class IndexListData{
    constructor() {
    }

    static getConnection(){
        return pool
    }

    static getIndexList(callback) {
        var conn = IndexListData.getConnection()
        conn.query("SELECT * FROM indexList", callback)
    }
}

module.exports = IndexListData