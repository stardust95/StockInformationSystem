var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'Express' });
});


router.get('/stock/:stockid', function (req, res) {
    res.render('stockinfo', {code : req.params.stockid})
})

router.get('/index', function (req, res) {
    res.render('indexlist', {code : req.params.indexid})
})


router.get('/index/:indexid', function (req, res) {
    res.render('indexdetail', {code : req.params.indexid})
})



module.exports = router;
