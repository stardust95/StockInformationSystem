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

var pool = mysql.createPool(config)

class StockData{
    constructor() {
    }

    static getConnection(){
        return pool
    }

    static getBasicInformation(code, callback){ // TODO: Optimize the schema of stockBasics
        var conn = StockData.getConnection()
        conn.query("SELECT A.* FROM stockBasics as A, stockList as B WHERE A.name = B.name AND code = " + code, callback)
    }

    static getRealtimePrice(code, callback) {
        var conn = StockData.getConnection()
        conn.query("SELECT * FROM stockList WHERE code = " + code, callback)
    }

    static getLatestTradeRecords(code, callback, limit){
        var conn = StockData.getConnection()
        var sql = "SELECT time, price, volume, amount FROM tradeRecords WHERE code = " + code + " ORDER BY time"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getBlockTradeRecords(code, callback, limit){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM tradeRecords WHERE code = " + code + " AND volume >= 8000 ORDER BY date"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getRealtimeQuotes(code, callback){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM realtimeQuotes WHERE code = " + code + " LIMIT 1"
        // sql += "ORDER BY DATE, TIME"
        conn.query(sql, callback)
    }

    static getStocksByDomain(domain, field, callback, limit){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM stockPriceForRank WHERE `" + domain + "` = '"+ field +"' ORDER BY mktcap DESC"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getStockNews(code, callback, limit){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM stockNews WHERE code = " + code + " ORDER BY date DESC"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getFinancialNews(callback, limit){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM financialNews ORDER BY date DESC"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getCompanyFinReport(code, callback){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM companyFinReport WHERE `code` = " + code
        conn.query(sql, callback)
    }

    static getCompanyProfit(code, callback){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM companyProfit WHERE `code` = " + code + " ORDER BY DATE"
        conn.query(sql, callback)
    }

    static getCompanyInfo(code,callback){
        var conn = StockData.getConnection()
        var sql = "SELECT * FROM companyInfo WHERE `证券代码` = "+ code
        conn.query(sql, callback)
    }

}

module.exports = StockData

