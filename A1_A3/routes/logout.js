var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	req.session.user.username = "";
	res.redirect('/');

    //res.render('main', { username:user.username});
});

module.exports = router;