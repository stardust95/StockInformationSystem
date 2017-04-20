/**
 * Created by stardust on 2017/4/20.
 */

var mysql = require('mysql')

var config = {
    host: "112.74.124.145",
    user: "group5",
    password: "group5",
    port: "3306",
    database: "stockG5"
};

class StockData{
    constructor() {

    }

    static getConnection(){
        return mysql.createConnection(config);
    }

    static getRealtimeData(code, callback) {
        var conn = StockData.getConnection()

        conn.query("SELECT * FROM stockList WHERE code = " + code, callback)

    }
}

module.exports = StockData

