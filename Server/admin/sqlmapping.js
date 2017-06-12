var sql = {
    createOrder: 'insert into orders(orderID,stockID,time,buyOrSell,way,orderNum,price,userID,userAccount) VALUES(NULL,?,CURRENT_TIMESTAMP,?,?,?,?,?,?)',
    queryOrder: 'select buyOrSell,orderNum,price,orderID from orders where orderID = ?,stockID = ?',
    queryAllOrder: 'select stockID,userID,orderNum,price,buyOrSell from orders where stockID = ? order by price asc,time desc',
    querySellOrder: 'select stockID,userID,orderID,buyOrSell,orderNum,price from orders where stockID=? and buyOrSell=? and price<=? order by price asc,time asc',
    queryBuyOrder: 'select stockID,userID,orderID,buyOrSell,orderNum,price from orders where stockID=? and buyOrSell=? and price>=? order by price desc,time asc',
    deleteOrder: 'delete from orders where orderID=?',
    updateOrder: 'update orders set orderNum=? where orderID=?',
    getBuyList: 'select buyOrSell,orderNum,price,orderID from orders where buyOrSell=? order by price desc limit ?,? ',
    getSellList: 'select buyOrSell,orderNum,price,orderID from orders where buyOrSell=?  order by price limit ?,?',
    getUserList: 'select buyOrSell,orderNum,price,orderID from orders where userID=?',
    queryOneBuyOrder: 'select stockID,userID,stockID,orderID,buyOrSell,way,orderNum,price from orders where stockID=? and buyOrSell=? order by price desc,time asc limit 1',
    getStockList: 'select distinct stockID from orders',
    createTradeRecord:'insert into traderecords(`code`,`date`,`time`,`price`,`change`,`volume`,`amount`,`type`,`purchaser`,`seller`) VALUES(?,?,?,?,?,?,?,?,?,?)',
    queryQuote:'select price,high,low,volume,amount from realtimequotes where code = ? limit 1',
    changeQuote:'update realtimequotes set price = ?, high = ?,low = ?,time = ?,date = ?, volume = ?, amount = ?, bid = ?, ask = ?, ' +
                'b1_p = ?, b1_v = ?, b2_p = ?, b2_v = ?,b3_p = ?, b3_v = ?,b4_p = ?, b4_v = ?,b5_p = ?, b5_v = ?, ' +
                'a1_p = ?, a1_v = ?, a2_p = ?, a2_v = ?,a3_p = ?, a3_v = ?,a4_p = ?, a4_v = ?,a5_p = ?, a5_v = ? where code = ?',
    queryBuyOrder5:'select orderNum,price from orders where buyOrSell= "0" order by price desc limit 5 ',
    querySellOrder5:'select orderNum,price from orders where buyOrSell= "1" order by price asc limit 5 ',
    updateOpen:'update realtimequotes set volume = 0, amount = 0,open = ?, pre_close = ? where code = ?',
    clean :'delete from orders where stockID = ? and orderNum = 0',
    getYesterday:'select `open`,`pre_close`,`price` from realtimequotes where `code` = ?'
};
// orderID,orderNum,price
module.exports = sql;