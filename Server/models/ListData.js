var getConnection = require('./DbConnection');

class ListData{

    static getIndexList(limit, callback) {
        var conn = getConnection();
        var sql = "SELECT * FROM indexList";
        if(limit>=0){
            sql += " LIMIT " + limit;
        }
        conn.query(sql, callback);
    }

    static getStockList(limit, callback) {
        var conn = getConnection();
        var sql = "SELECT * FROM stockList";
        if(limit>=0){
            sql += " LIMIT " + limit;
        }
        conn.query(sql, callback);
    }

    //get financial news list
    static getFinaNewsList(limit, callback){
        var conn = getConnection();
        var sql = "SELECT * FROM financialNews ORDER BY date DESC";
        if(limit>=0){
            sql += " LIMIT " + limit;
        }
        conn.query(sql, callback);
    }
    //TODO: get stock news list (too many =_=)
    static getStockNewsList(limit, callback){
        var conn = getConnection();
        var sql = "SELECT * FROM stockNews ORDER BY date DESC";
        if(limit>=0){
            sql += " LIMIT " + limit;
        }
        conn.query(sql, callback);
    }
    //get industry hist data
    static getIndustryHistList(limit, callback) {
        var conn = getConnection();
        var sql = "SELECT * FROM industryHistData ORDER BY avgp_change DESC, avgprice DESC";
        if(limit>=0){
            sql += " LIMIT " + limit;
        }
        conn.query(sql, callback);
    }

    //get index curve
    //standard: use close price draw curve
    static getIndexHistData(code, callback) {
        var conn = getConnection();
        var sql = "SELECT date, close FROM indexHistData where code = " + code + " ORDER BY date";
        conn.query(sql, callback);
    }
    //get stock curve
    //standard: use close price draw curve
    static getStockHistData(code, callback) {
        var conn = getConnection();
        var sql = "SELECT date, close FROM stockHistData where code = " + code + " ORDER BY date";
        conn.query(sql, callback);
    }

    static getCompanyIncList(limit, callback) {
        var conn = getConnection();
        var date = '2017-1';
        var sql = "SELECT * FROM companyprofit where date ="+date+" ORDER BY net_profit_ratio DESC";
        if(limit>=0){
            sql += " LIMIT " + limit;
        }
        conn.query(sql, callback);
    }

    static getCompanyDecList(limit, callback) {
        var conn = getConnection();
        var date = '2017-1';
        var sql = "SELECT * FROM companyprofit where date = "+date+" ORDER BY net_profit_ratio";
        if(limit>=0){
            sql += " LIMIT " + limit;
        }
        conn.query(sql, callback);
    }
}

module.exports = ListData;