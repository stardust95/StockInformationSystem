/**
 * Created by stardust on 2017/5/27.
 */

var redis = require('redis')

let option = {
    port: 6379,
    host: "112.74.124.145",
    expireTime: 1,
}
let prefix = "sess:"        // default prefix in connect-redis
let client = redis.createClient(option.port, option.host)

client.on("error", function (err) {
    console.log("Redis Error: " + err)
})
// exports.client = client
exports.cache = function(key, value, notExpire, time) {
    if( notExpire )
        return client.set(key, value)
    else
        return client.set(key, value, "EX", time ? time : option.expireTime)
}
exports.get = function (key, callback) {
    return client.get(key, callback);
}

module.exports = (req, res, next) => {
    if( req.query.session ){
        let sessionKey = prefix + req.query.session
        console.log("url = " + req.url)
        console.log("In redisdb.js, sessionKey = " + sessionKey)
        client.get(sessionKey, function (err, reply) {
            if( err ){
                console.log(err)
            }else if( reply ){      // if user logged in
                res.locals.session = JSON.parse(reply)
                // console.log("session = " + JSON.stringify(res.locals.session))
            }
            next()
        })
    }else{
        next()
    }
}
