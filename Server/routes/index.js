var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:stockid', function (req, res) {
    res.render('stockinfo', {code : req.params.stockid})
})

module.exports = router;
