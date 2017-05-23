/**
 * Created by stardust on 2017/4/20.
 */
var getConnection = require('./DbConnection')

// Todo: http://www.dengzhr.com/node-js/877

function getCurrentTime() {
    let date = new Date()
    return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + " " + date.toLocaleTimeString();
}

class StockData{

    static getCodesList(callback){
        var conn = getConnection()
        conn.query("SELECT code FROM stockList",callback)
    }

    static getMultipleStocks(list, callback){
        var conn = getConnection()
        var sql = "SELECT code, name, trade, changepercent, settlement FROM stockList WHERE"
        if( list.length > 0 ){
            for(let index in list){
                sql += " CODE = " + list[index]
                if( index < list.length-1 ){
                    sql += " OR"
                }
            }
        }else{
            sql += " FALSE"
        }
        conn.query(sql, callback)
    }

    static getBasicInformation(code, callback){ // TODO: Optimize the schema of stockBasics
        var conn = getConnection()
        conn.query("SELECT A.* FROM stockBasics as A, stockList as B WHERE A.name = B.name AND code = " + code, callback)
    }

    static getRealtimePrice(code, callback) {
        var conn = getConnection()
        conn.query("SELECT * FROM stockList WHERE code = " + code, callback)
    }

    static getLatestTradeRecords(code, callback, limit){
        var conn = getConnection()
        var sql = "SELECT time, price, volume, amount FROM tradeRecords WHERE code = " + code + " ORDER BY time"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getBlockTradeRecords(code, callback, limit){
        var conn = getConnection()
        var sql = "SELECT * FROM tradeRecords WHERE code = " + code + " AND volume >= 8000 ORDER BY date"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getRealtimeQuotes(code, callback){
        var conn = getConnection()
        var sql = "SELECT * FROM realtimeQuotes WHERE code = " + code + " LIMIT 1"
        // sql += "ORDER BY DATE, TIME"
        conn.query(sql, callback)
    }

    static getStocksByDomain(domain, field, callback, limit){
        var conn = getConnection()
        var sql = "SELECT * FROM stockPriceForRank WHERE `" + domain + "` = '"+ field +"' ORDER BY mktcap DESC"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getStockNews(code, callback, limit){
        var conn = getConnection()
        var sql = "SELECT * FROM stockNews WHERE code = " + code + " ORDER BY date DESC"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getFinancialNews(callback, limit){
        var conn = getConnection()
        var sql = "SELECT * FROM financialNews ORDER BY date DESC"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getCompanyFinReport(code, callback){
        var conn = getConnection()
        var sql = "SELECT * FROM companyFinReport WHERE `code` = " + code
        conn.query(sql, callback)
    }

    static getCompanyProfit(code, callback){
        var conn = getConnection()
        var sql = "SELECT * FROM companyProfit WHERE `code` = " + code + " ORDER BY DATE"
        conn.query(sql, callback)
    }

    static getCompanyInfo(code,callback){
        var conn = getConnection()
        var sql = "SELECT * FROM companyInfo WHERE `证券代码` = "+ code
        conn.query(sql, callback)
    }

    static getComment(code, callback){
        var conn = getConnection();
        var sql = "SELECT * FROM `stockUserComments` WHERE `stockCode` = ?"
        conn.query(sql, [code], callback)
    }

    /* SQL Injection
    * */
    static postComment(code, user, content, callback){
        var conn = getConnection();
        var sql = "INSERT IGNORE `stockUserComments`(`stockCode`, \
                `user`, \
            `date`, \
            `content`, \
            `approval`) VALUES(?, ?, ?, ?, 0)"
        conn.query(sql, [code, user, getCurrentTime(), content], callback)
    }

    static search(keyword, callback){
        var conn = getConnection();
        var sql = "SELECT * FROM stockg5.stocklist WHERE code like ? or name like ?;"
        keyword = '%' + keyword + '%'
        conn.query(sql, [keyword, keyword], callback)
    }

}

module.exports = StockData

