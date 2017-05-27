/**
 * Created by stardust on 2017/5/23.
 */


var getConnection = require('./DbConnection')

class UserData{

    static getHoldiingStocks(user, callback, stock){
        var conn = getConnection()
        var sql = "SELECT * FROM userStocks WHERE account = ?"
        var params = [user]
        if( stock ){
            sql += " AND stockCode = ?"
            params.push(stock)
        }
        conn.query(sql, params, callback)
    }

    static getTradeRecords(user, callback, stock, limit){
        var conn = getConnection()
        var params = [user, user]
        if( !limit )
            limit = 50
        var sql = "SELECT * FROM tradeRecords WHERE (purchaser = ? OR seller = ?)"
        if( stock ){
            sql += " AND code = ?"
            params.push(stock)
        }
        sql += " ORDER BY date, time"
        sql +=" LIMIT " + limit
        conn.query(sql, params, callback)
    }

    static purchase(user, stock, amount, callback){

    }

    static sell(user, stock, amount, callback){

    }

}

module.exports = UserData
