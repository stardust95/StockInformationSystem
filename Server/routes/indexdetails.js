/**
 * Created by stardust on 2017/4/20.
 */

var express = require('express');
var IndexData = require('../models/IndexData')
var router = express.Router();

/* GET index basic info. */
router.get('/info/:indexid', function(req, res, next) {
    IndexData.getIndexRealtimeData(req.params.indexid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result[0])
        }
    })
});

router.get('/stocks/:indexid/:type?', function (req, res) {
    IndexData.getRiseAndFallStocks(req.params.indexid, req.params.type, function (err, result) {
        if( err ){
            console.log(err)
            res.status(500).send()
        }else{
            res.json(result)
        }
    }, req.query.limit)
})

/* GET index trade records info. */
router.get('/trades/:indexid', function(req, res, next) {
    IndexData.getIndexTradeRecords(req.params.indexid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result)
        }
    })
});

/* GET hot stocks of this index info. */
router.get('/hot/:indexid/:limit?', function (req, res) {
    IndexData.getHotStocks(req.params.indexid, function (err, result) {
        if( err ){
            console.log(err);
            res.json()
        }else{
            res.json(result);
        }
    }, req.params.limit);
})

router.get('/history/:indexid', function(req, res){
    IndexData.getIndexHistData(req.params.indexid, function(err, result) {
        if( err ){
            console.log(err)
            res.json({})
        }else {
            if( result.length > 0 ){
                res.json(result[0])
            }else{
                res.json({})
            }
        }
    })
})

module.exports = router;