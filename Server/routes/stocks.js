/**
 * Created by stardust on 2017/4/20.
 */

var express = require('express');
var stockData = require('../models/stockData')
var router = express.Router();

/* GET stock realtime data. */
router.get('/realtime/:stockid', function(req, res, next) {
    var result = stockData.getRealtimeData(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
        }else{
            res.json(result[0])
        }
    })
});

module.exports = router;