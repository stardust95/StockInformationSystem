/**
 * Created by stardust on 2017/5/27.
 */
var redis = require('redis');
var express = require('express');
var router = express.Router();

var option = {
    port: 6379,
    host: "112.74.124.145"
}
var prefix = "sess:"        // default prefix in connect-redis
var client = redis.createClient(option.port, option.host)

client.on("error", function (err) {
    console.log("Redis Error: " + err)
})

router.get('/', function (req, res, next) {
        if (req.query.session) {
            var sessionKey = prefix + req.query.session
            console.log("url = " + req.url)
            console.log("In redisdb.js, sessionKey = " + sessionKey)
            client.get(sessionKey, function (err, reply) {
                if (err) {
                    console.log(err)
                } else if (reply) {      // if user logged in
                    res.locals.session = JSON.parse(reply)
                    console.log("session = " + JSON.stringify(res.locals.session))
                }
                next()
            })
        } else {
            next()
        }
});
module.exports = router;
