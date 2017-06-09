/**
 * Created by stardust on 2017/4/20.
 */

var express = require('express');
var IndexData = require('../models/IndexData')
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var session = require('../models/Redisdb');
var cache = require('../models/Redisdb').cache;
var load = require('../models/Redisdb').load;

let commentTemplate = ejs.compile(fs.readFileSync('views/commentitem.ejs', 'utf-8'));

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


router.get('/comment/:stockid', function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    IndexData.getComment(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json({message: "Invalid parameters"})
        }else{
            var ret = ''
            for(let index in result){
                ret += commentTemplate({ comment: result[index] }) + "\n"
            }
            res.send(ret)
        }
    })
})

/* upload new commens
 * {
 *     user: ,
 *     text:
 * }
 * */
router.post('/comment/:stockid', function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    console.log(req.body);
    if( req.body.user && req.body.text ){
        IndexData.postComment(req.params.stockid, req.body.user, req.body.text,
            function (err, result) {
                if( err ){
                    console.log(err)
                    res.status(500).json()
                }else{
                    res.status(201).json({ success: true })
                }
            })
    }else{
        res.status(200).json({ message: "Invalid user or content"})
    }
})

module.exports = router;