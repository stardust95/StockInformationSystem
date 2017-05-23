/**
 * Created by stardust on 2017/4/20.
 */

var express = require('express');
var StockData = require('../models/StockData')
var ejs = require('ejs')
var router = express.Router();
var fs = require('fs')

let commentTemplate = ejs.compile(fs.readFileSync('views/commentitem.ejs', 'utf-8'))

/* GET stock basic info. */
router.get('/info/:stockid', function(req, res, next) {
    StockData.getBasicInformation(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result[0])
        }
    })
});


/* GET stock realtime data. */
router.get('/realtime/:stockid', function(req, res, next) {
    StockData.getRealtimePrice(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result[0])
        }
    }, req.limit)
});

/* GET stock trading records. */
router.get('/trades/:stockid/:limit?',function (req, res) {
    StockData.getLatestTradeRecords(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result)
        }
    }, req.params.limit)
})


/* GET block trading records. */
router.get('/blocks/:stockid/:limit?',function (req, res) {
    StockData.getBlockTradeRecords(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result)
        }
    }, req.params.limit)
})


/* GET stock realtime quotes. */
router.get('/quotes/:stockid',function (req, res) {
    StockData.getRealtimeQuotes(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result[0])
        }
    })
})

/* GET stocks of the same industry or area.
*  domain should be `industry` or `area`
* */
router.get('/rank/:domain/:field/:limit?',function (req, res) {
    StockData.getStocksByDomain(req.params.domain, req.params.field, function (err, result) {
        if( err ){
            console.log(err);
            res.json()
        }else{
            res.json(result)
        }
    }, req.params.limit)
});


/* GET news of a stock. */
router.get('/news/:stockid/:limit?',function (req, res) {
    StockData.getStockNews(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result)
        }
    }, req.params.limit)
})

/* GET finantial news . */
router.get('/newsList/:limit?',function (req, res) {
    StockData.getFinancialNews(function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result)
        }
    }, req.params.limit)
})

/* GET information of a company. */
router.get('/comp/:stockid',function (req, res) {
    StockData.getCompanyInfo(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result[0])
        }
    })
})

/* GET profits of a company. */
router.get('/profit/:stockid',function (req, res) {
    StockData.getCompanyProfit(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result)
        }
    })
})

router.get('/comment/:stockid', function (req, res) {
    StockData.getComment(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
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