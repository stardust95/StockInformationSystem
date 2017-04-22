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

    static getRealtimePrice(code, callback) {
        var conn = StockData.getConnection()
        conn.query("SELECT * FROM stockList WHERE code = " + code, callback)
    }

    static getLatestTradeRecords(code, callback, limit){
        var conn = StockData.getConnection()
        var sql = "SELECT time, price, volume, amount FROM tradeRecords WHERE code = " + code
        if( limit ){
            sql += " LIMIT " + limit
        }
        conn.query(sql, callback)
    }

    static getRealtimeQuotes(code, callback){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM realtimeQuotes WHERE code = " + code + " LIMIT 1"
        // sql += "ORDER BY DATE, TIME"
        conn.query(sql, callback)
    }


}

module.exports = StockData

