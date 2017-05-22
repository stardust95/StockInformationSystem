var express = require('express');
var ListData = require('../models/ListData');
var router = express.Router();
router.get('/:listkind', function(req, res, next) {
    var list_kind = req.params.listkind;
    if(list_kind == "index")
        list_kind = "指数列表";
    else if(list_kind == "stock")
        list_kind = "股票列表";
    else if(list_kind == "news")
        list_kind = "新闻列表";
    else if(list_kind == "industry")
        list_kind = "板块列表";
    res.render('templatelist',{listkind: list_kind});
});

router.get('/data/:listkind/:limit', function(req, res, next) {
    if (req.params.listkind == "index")
    {
        ListData.getIndexList(req.params.limit,function (err, result) {
            if( err ){
                console.log(err);
                res.json()
            }else{
                res.json(result)
            }
        });
    }
    else if (req.params.listkind == "stock")
    {
        ListData.getStockList(req.params.limit,function (err, result) {
            if( err ){
                console.log(err);
                res.json()
            }else{
                res.json(result)
            }
        });
    }
    else if(req.params.listkind == "news")
    {
        ListData.getFinaNewsList(req.params.limit, function (err, result) {
            if( err ){
                console.log(err);
                res.json()
            }else{
                res.json(result)
            }
        })
    }
    else if(req.params.listkind == "industry")
    {
        ListData.getIndustryHistList(req.params.limit, function (err, result) {
            if( err ){
                console.log(err);
                res.json()
            }else{
                res.json(result)
            }
        })
    }
});

//TODO：以下不需要放在该文件内
router.get('/curve/stock/:code', function(req, res, next) {
    ListData.getStockHistData(req.params.code,function (err, result) {
        if( err ){
            console.log(err);
            res.json()
        }else{
            res.json(result)
        }
    });
});

router.get('/curve/index/:code', function(req, res, next) {
    ListData.getIndexHistData(req.params.code,function (err, result) {
        if( err ){
            console.log(err);
            res.json();
        }else{
            res.json(result);
        }
    });
});

router.get('/company/inc/:limit', function(req, res, next) {
    ListData.getCompanyIncList(req.params.limit,function (err, result) {
        if( err ){
            console.log(err);
            res.json();
        }else{
            res.json(result);
        }
    });
});

router.get('/company/dec/:limit', function(req, res, next) {
    ListData.getCompanyDecList(req.params.limit,function (err, result) {
        if( err ){
            console.log(err);
            res.json();
        }else{
            res.json(result);
        }
    });
});

module.exports = router;