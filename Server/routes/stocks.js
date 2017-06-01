/**
 * Created by stardust on 2017/4/20.
 */

var express = require('express');
var StockData = require('../models/StockData')
var ejs = require('ejs');
var router = express.Router();
var fs = require('fs');
var session = require('../models/Redisdb');
var cache = require('../models/Redisdb').cache;
var load = require('../models/Redisdb').load;

let commentTemplate = ejs.compile(fs.readFileSync('views/commentitem.ejs', 'utf-8'));
function redisWrapper(key, callback) {
    load(key, function (err, reply) {
        console.log("here");
        if( err ){
            console.log(err)
            res.status(500).json({
                message: "redis error"
            })
        }else if( reply ){
            console.log("redis hit")
            return res.send(reply)
        }else{
            return callback()
        }
    })
}

/* GET stock basic info. */
router.get('/info/:stockid', function(req, res, next) {
    let key = JSON.stringify({
        type: "info",
        stock: req.params.stockid
    })
    redisWrapper(key, function () {
        StockData.getBasicInformation(req.params.stockid, function (err, result) {
            if( err ){
                console.log(err)
                res.json({message: "Invalid parameters"})
            }else{
                if(result.length > 0){
                    cache(key, JSON.stringify(result[0]))
                    res.json(result[0])
                }
                else{
                    cache(key, JSON.stringify(result))
                    res.json(result)
                }
            }
        })
    })
});

/* GET stock realtime data. */
router.get('/realtime/:stockid', function(req, res, next) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    redisWrapper(key, function () {
        StockData.getRealtimePrice(req.params.stockid, function (err, result) {
            if( err ){
                console.log(err);
                res.json({message: "Invalid parameters"})
            }else{
                if(result.length > 0){
                    cache(key, JSON.stringify(result[0]))
                    res.json(result[0])
                }else{
                    cache(key, JSON.stringify(result))
                    res.json(result)
                }
            }
        })
    })

});

/* GET stock trading records. */
router.get('/trades/:stockid/:limit?',function (req, res) {
    let key = JSON.stringify({
        type: "trades",
        stock: req.params.stockid
    })
    redisWrapper(key, function () {
        StockData.getLatestTradeRecords(req.params.stockid, function (err, result) {
            if( err ){
                console.log(err);
                res.json({message: "Invalid parameters"})
            }else{
                res.json(result)
            }
        }, req.params.limit)
    })

})

/* GET block trading records. */
router.get('/blocks/:stockid/:limit?',function (req, res) {
    let key = JSON.stringify({
        type: "blocks",
        stock: req.params.stockid
    })
    redisWrapper(key, function () {

        StockData.getBlockTradeRecords(req.params.stockid, function (err, result) {
            if( err ){
                console.log(err)
                res.json({message: "Invalid parameters"})
            }else{
                res.json(result)
            }
        }, req.params.limit)
    })
})

router.get('/hist/:stockid', function (req, res) {
    let key = JSON.stringify({
        type: "hist",
        stock: req.params.stockid
    })
    redisWrapper(key, function () {
        StockData.getStockHistData(req.params.stockid, function (err, result) {
            if( err ){
                console.log(err)
                res.json({ message: "Invalid parameters" });
            }else{
                res.json(result);
            }
        })
    })
});

/* GET stock realtime quotes. */
router.get('/quotes/:stockid',function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    StockData.getRealtimeQuotes(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json({message: "Invalid parameters"})
        }else{
            if(result.length > 0)
                res.json(result[0])
            else
                res.json(result)
        }
    })
})

/* GET stocks of the same industry or area.
*  domain should be `industry` or `area`
* */
router.get('/rank/:domain/:field/:limit?',function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    StockData.getStocksByDomain(req.params.domain, req.params.field, function (err, result) {
        if( err ){
            console.log(err);
            res.json({message: "Invalid parameters"})
        }else{
            res.json(result)
        }
    }, req.params.limit)
});


/* GET news of a stock. */
router.get('/news/:stockid/:limit?',function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    StockData.getStockNews(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json({message: "Invalid parameters"})
        }else{
            res.json(result)
        }
    }, req.params.limit)
})

/* GET finantial news . */
router.get('/newsList/:limit?',function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    StockData.getFinancialNews(function (err, result) {
        if( err ){
            console.log(err)
            res.json({message: "Invalid parameters"})
        }else{
            res.json(result)
        }
    }, req.params.limit)
})

/* GET information of a company. */
router.get('/comp/:stockid',function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    StockData.getCompanyInfo(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json({message: "Invalid parameters"})
        }else{

            if(result.length > 0)
                res.json(result[0])
            else
                res.json(result)
        }
    })
})

/* GET profits of a company. */
router.get('/profit/:stockid',function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    StockData.getCompanyProfit(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json({message: "Invalid parameters"})
        }else{
            res.json(result)
        }
    })
})

router.get('/comment/:stockid', function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    StockData.getComment(req.params.stockid, function (err, result) {
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
    if( req.body.user && req.body.text ){
        StockData.postComment(req.params.stockid, req.body.user, req.body.text,
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

router.get('/search', function (req, res) {
    let key = JSON.stringify({
        type: "realtime",
        stock: req.params.stockid
    })
    let keyword = req.query.keyword
    if( keyword ){
        StockData.search(keyword, function (err, result) {
            if( err ){
                console.log(err)
                res.status(500).render('error', {
                    status: 500,
                    message: "Internal Error"
                })
            }else {
                res.render('stocksearch', {
                    keyword: keyword,
                    stocks: result
                })
            }
        })
    }else{
        res.render('error', {
            status: 404,
            message: "Invalid search"
        })
    }
})


module.exports = router;