var express = require('express');
var router = express.Router();
var Orders = require("../models/orders.js");

/* GET home page. */
router.get('/', function(req, res) {
    var username	 = req.session.user.username;
	var orders = new Orders({
		userAccount : username
	});
	orders.ordersInfo(function(err,result){
		res.render('orders', {data: result});

	});
  
});

module.exports = router;