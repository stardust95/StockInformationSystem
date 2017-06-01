var express = require('express');
var router = express.Router();
var UserData = require('../models/UserData')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* 交易生效
* 输入:
* {
*   type:  (1为买入，0为卖出)
*   stock（股票id）
*   account(用户账户)
*   number（数量）
* }
* 输出:
* {
*   success: true/false,
*   message: "" （若success=false则说明原因）
* }
* */
router.post('/trade', function (req, res) {
  let type = Number(req.body.type);
  let stock = req.body.stock;
  let account = req.body.account;
  let number = req.body.number;
  if( type === undefined || !stock || !account || !number ){
      res.json({
          success: false,
          message: "Incomplete fields"
      })
      return;
  }
  // console.log("type = " + (type === 0));
  var callback = function (err, data) {
      if( err ){
          console.log(err)
          res.status(500).json({
              success: false,
              message: "Internal error"
          })
      }else{
          res.json({
              success: true,
              data: data
          })
      }
  }
  UserData.findUser(account, function (err, data) {
      if( err ){
          console.log(err)
          res.status(500).json({
              success: false,
              message: "Internal error"
          })
      }else if( data.length === 0 ){
          res.status(404).json({
              success:false,
              message: "Unknown user"
          })
      }else{
          if( type === 1 ){
              UserData.purchase(account, stock, number, callback)
          }else if( type === 0 ){    // TODO: ensure the holding amount of stocks enough
              UserData.sell(account, stock, number, callback)
          }else{
              res.json({
                  success: false,
                  message: "Invalid type field"
              })
          }
      }
  })

})

router.get('/stocks', function (req, res) {
  let user = req.query.account;
  let stock = req.query.stock;
  if( user ){
      UserData.getHoldiingStocks(user, function (err, data) {
          if( err ){
              console.log(err)
              res.status(500).json({
                  success: false,
                  message: "Internal error"
              })
          }else{
              res.json({
                  success: true,
                  data: data
              })
          }
      }, stock)
  }else{
    res.json({
        success: false,
        message: "Invalid request (Please specify account field in query parameters)"
    })
  }
})

router.get('/records', function (req, res) {
    let user = req.query.account;
    let limit = req.query.limit;
    let stock = req.query.stock;
    if( user ){
        UserData.getTradeRecords(user, function (err, data) {
            if( err ){
                console.log(err)
                res.status(500).json({
                    success: false,
                    message: "Internal error"
                })
            }else{
                res.json({
                    success: true,
                    data: data
                })
            }
        }, stock, limit)
    }else{
        res.json({
            success: false,
            message: "Invalid request (Please specify account field in query parameters)"
        })
    }
})

module.exports = router;
