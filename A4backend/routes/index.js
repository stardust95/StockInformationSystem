var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    //req.session.username = res.locals.session.user;
    req.session.username = "3140";
    req.session.stockID =  "000001";
    res.render('index');
});

module.exports = router;
