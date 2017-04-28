
var getConnection = require('./DbConnection')


var pool = mysql.createPool(config)

class IndexListData{

    static getIndexList(callback) {
        var conn = getConnection()
        conn.query("SELECT * FROM indexList", callback)
    }
}

module.exports = IndexListData