var express = require('express');
var StockData = require('../models/StockData');
var IndexData = require('../models/IndexData');
var oneSignal = require('../models/onesignal')
var cache = require('../models/Redisdb').cache;
var load = require('../models/Redisdb').load;
var request = require('request')
var router = express.Router();
var stockList = [];
var indexList = [];


StockData.getCodesList(function (err, result) {
    if( err ){
        console.log(err)
    }else{
        result.forEach(obj => stockList.push(obj.code));
    }
});

IndexData.getCodesList(function (err, result) {
    if( err ){
        console.log(err)
    }else{
        result.forEach(obj => indexList.push(obj.code));
    }
});

/* GET home page. */
router.get('/', function(req, res, next) {
    // console.log(req.cookies);
    var arr;
    if( !req.cookies.visited ){     // first visit
        arr = []
        request.get('http://123.206.106.195:3000/news/list?html=0&offset=0&limit=1&genre=finance',
            function (err, response, body) {
                if( !err && response.statusCode == "200" ){
                    var list = JSON.parse(body)
                    if( list.length > 0 ){
                        console.log("news title = " + list[0].title)
                        oneSignal.sendNotification(list[0].title, {
                            included_segments: ['All']
                        });
                    }
                }
            })
    }else{
        arr = req.cookies.visited.split('|').filter(item => stockList.includes(item));
    }
    StockData.getMultipleStocks(arr, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.render('home', { code: '000001', history: result, host: req.get('Host'), protocol: req.protocol });
        }
    })
});


router.get('/index', function (req, res) {
    console.log(req.cookies);
    res.render('indexlist', {code : req.params.indexid})
})

router.get('/stock/:stockid', function (req, res) {
    let stock = req.params.stockid;
    var cookiestr;
    // console.log(res.locals.session.user)
    if( !isNumber(stock) || !stockList.includes(stock) ){
        res.render('error', {status: 404, message: "Page Not Found"})
        return
    }
    if( !req.cookies.visited ){
        cookiestr = ''
    }else{
        cookiestr = req.cookies.visited
    }
    var arr = cookiestr.split('|');
    if( arr.includes(stock) ){
        arr = arr.filter( item => item !== stock ).filter( item => stockList.includes(item) )
    }
    arr.push(stock);
    console.log(req.cookies.visited);
    res.cookie('visited', arr.join('|'));
    StockData.getMultipleStocks(arr, function (err, result) {
        if( err ){
            console.log(err);
            res.json()
        }else{
            res.render('stockinfo', {code: stock, history: result, host: req.get('Host'), protocol: req.protocol } )
        }
    });
});

router.get('/index/:indexid', function (req, res) {
    let index = req.params.indexid;
    var cookiestr;

    if( !isNumber(index) || !indexList.includes(index) ){
        res.render('error', {status: 404, message: "Page Not Found"})
        return
    }

    if( !req.cookies.visited ){
        cookiestr = ''
    }else{
        cookiestr = req.cookies.visited
    }
    var arr = cookiestr.split('|').filter(item => stockList.includes(item));
    arr.push(index)
    res.cookie('visited', arr.join('|'));

    StockData.getMultipleStocks(arr, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.render('indexdetail', {code: index, history: result, host: req.get('Host'), protocol: req.protocol } )
        }
    });
})

router.get('/trade',  function (req, res, next) {
    //req.session.username = res.locals.session.user;
    // req.session.username = "3140";
    // req.session.stockID =  "000001";
    req.session.stockID = req.query.stockID;
    console.log("req.query.stockID = " + req.query.stockID);

    StockData.getRealtimePrice(req.session.stockID, (err, result) =>{
        if( err ){
            console.log(err);
            return res.status(500).json();
        }else{
            console.log("result = " + JSON.stringify(result));
            if( result.length > 0 ){
                res.render('trade', {
                    stockCode: req.session.stockID,
                    stockName: result[0].name
                });
            }else{
                return res.status(404).json();
            }
        }
    })
});

function isNumber(str) {
    let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ]
    for(var index in str){
        if( !numbers.includes(str[index]) )
            return false
    }
    return true
}


module.exports = router;
