/**
 * Created by stardust on 2017/4/27.
 */


var getConnection = require('./DbConnection')

class IndexData{

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

    static getIndexTradeRecords(code, date, callback, limit){
        var conn= getConnection()
        var sql = "SELECT * FROM indexTradeRecords WHERE code = " + code + " AND date = " + date + " ORDER BY TIME DESC"
        if( !limit ){
            limit = 10
        }
        sql += " LIMIT " + limit
        conn.query(sql, callback)
    }

}

module.exports = IndexData