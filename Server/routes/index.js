var express = require('express');
var StockData = require('../models/StockData');
var IndexData = require('../models/IndexData');
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
    if( !req.cookies.visited ){
        arr = []
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
    arr.push(stock)
    console.log(req.cookies.visited);
    res.cookie('visited', arr.join('|'));
    StockData.getMultipleStocks(arr, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.render('stockinfo', {code: stock, history: result, host: req.get('Host'), protocol: req.protocol } )
        }
    });

})

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

function isNumber(str) {
    let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ]
    for(var index in str){
        if( !numbers.includes(str[index]) )
            return false
    }
    return true
}

module.exports = router;
