var express = require('express');
var StockData = require('../models/StockData')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.cookies);
  res.render('home', { title: 'Express' });
});


router.get('/index', function (req, res) {
    console.log(req.cookies);
    res.render('indexlist', {code : req.params.indexid})
})

router.get('/stock/:stockid', function (req, res) {
    let stock = req.params.stockid;
    var cookiestr;
    if( !req.cookies.visited ){
        cookiestr = ''
    }else{
        cookiestr = req.cookies.visited
    }
    var arr = cookiestr.split('|').slice(0, -1);
    if( arr.includes(stock) ){
        arr = arr.filter( item => item !== stock )
    }
    cookiestr += stock + '|';
    console.log(req.cookies.visited);
    res.cookie('visited', cookiestr);
    StockData.getMultipleStocks(arr, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.render('stockinfo', {code: stock, history: result } )
        }
    });

})

router.get('/index/:indexid', function (req, res) {
    let index = req.params.indexid;
    var cookiestr;
    if( !req.cookies.visited ){
        cookiestr = ''
    }else{
        cookiestr = req.cookies.visited
    }
    var arr = cookiestr.split('|').slice(0, -1);
    res.cookie('visited', cookiestr);

    StockData.getMultipleStocks(arr, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.render('indexdetail', {code: index, history: result } )
        }
    });
})


module.exports = router;
