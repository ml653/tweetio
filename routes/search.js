var express = require('express');
var router = express.Router();
var tweet = require('../js/tweet');

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(req.param('v'));
  var query = req.param('v');

  if(query == 'available') {
    tweet.twitter.get('trends/available', {}, function (err, data, response) {
      res.send(data);
    })
  } else {
    tweet.twitter.get('trends/place', {id: query}, function (err, data, response) {
      res.send(data);
    })
  }
});

module.exports = router;
