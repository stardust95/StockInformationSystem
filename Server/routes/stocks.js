/**
 * Created by stardust on 2017/4/20.
 */

var express = require('express');
var StockData = require('../models/stockData')
var router = express.Router();

/* GET stock realtime data. */
router.get('/realtime/:stockid', function(req, res, next) {
    StockData.getRealtimePrice(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
        }else{
            res.json(result[0])
        }
    }, req.limit)
});

/* GET stock trading records. */
router.get('/trades/:stockid/:limit',function (req, res) {
    StockData.getLatestTradeRecords(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
        }else{
            res.json(result)
        }
    }, req.params.limit)
})

router.get('/quotes/:stockid',function (req, res) {
    StockData.getRealtimeQuotes(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
        }else{
            res.json(result[0])
        }
    })
})



module.exports = router;