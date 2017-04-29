
var getConnection = require('./DbConnection')


class IndexListData{

    static getIndexList(callback) {
        var conn = getConnection()
        conn.query("SELECT * FROM indexList", callback)
    }
}

module.exports = IndexListData