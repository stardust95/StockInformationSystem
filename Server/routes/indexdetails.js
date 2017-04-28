/**
 * Created by stardust on 2017/4/20.
 */

var express = require('express');
var IndexData = require('../models/IndexData')
var router = express.Router();

/* GET stock basic info. */
router.get('/info/:stockid', function(req, res, next) {
    IndexData.getIndexRealtimeData(req.params.stockid, function (err, result) {
        if( err ){
            console.log(err)
            res.json()
        }else{
            res.json(result[0])
        }
    })
});


module.exports = router;