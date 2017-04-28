var express = require('express');
var IndexListData = require('../models/IndexListData');
var router = express.Router();
router.get('/', function(req, res, next) {
  res.render('indexlistinfo');
});

router.get('/list', function(req, res, next) {
    IndexListData.getIndexList(function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result)
        }
    })
});

module.exports = router;