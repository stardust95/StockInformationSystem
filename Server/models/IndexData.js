/**
 * Created by stardust on 2017/4/27.
 */


var getConnection = require('./DbConnection')

class IndexData{

    static getCodesList(callback){
        var conn = getConnection()
        conn.query("SELECT code FROM indexList", callback)
    }

    static getIndexRealtimeData(code, callback) {
        var conn = getConnection()
        var sql = "SELECT * FROM indexList WHERE code = " + code
        conn.query(sql, callback)
    }

    static getIndexHistData(code, callback){
        var conn = getConnection()
        var sql = "SELECT * FROM indexHistData WHERE code = " + code
        conn.query(sql, callback)
    }

    static getIndustryHistData(date, orderby, callback, limit){
        var conn= getConnection()
        var sql = "SELECT * FROM industryHistData WHERE date = " + date + " ORDER BY " + orderby
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getIndexTradeRecords(code, callback, date, limit){
        var conn= getConnection()
        var sql = "SELECT * FROM indexTradeRecords WHERE code = " + code
        if( date ){
            sql += " AND date = " + date
        }
        sql += " ORDER BY TIME DESC"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

    static getHotStocks(code, callback, limit){
        var conn = getConnection()
        if( !limit ){
            limit = 10
        }
        conn.query("SELECT * FROM indexContainStocks WHERE hot != 0 AND indexCode = " + code + " LIMIT " + limit, callback)
    }

    static getComment(code, callback){
        var conn = getConnection();
        var sql = "SELECT * FROM `indexUserComments` WHERE `indexCode` = ?"
        conn.query(sql, [code], callback)
    }

    static postComment(code, user, content, callback){
        var conn = getConnection();
        var sql = "INSERT IGNORE `indexUserComments`(`indexCode`, \
                `user`, \
            `date`, \
            `content`, \
            `approval`) VALUES(?, ?, ?, ?, 0)"
        conn.query(sql, [code, user, getCurrentTime(), content], callback)
    }
}

module.exports = IndexData