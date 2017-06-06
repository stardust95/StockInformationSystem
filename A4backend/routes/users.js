var express = require('express');
var router = express.Router();

var admin = require('../admin/admin');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/checkOrder', function (req, res, next) {
    admin.checkOrder(req, res, next);
});

router.post('/getList', function (req, res, next) {
    admin.getList(req, res, next);
});

router.post('/getUserList', function (req, res, next) {
    admin.getUserList(req, res, next);
});

router.post('/deleteOrder', function (req, res, next) {
    admin.deleteOrder(req, res, next);
});

module.exports = router;
