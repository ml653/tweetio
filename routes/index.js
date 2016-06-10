var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.sendFile(path.resolve(__dirname+"/../public/index.html"));
});

router.get('/search', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.json({a:'b'});
  console.log('param: ' + req.param.variable_name);
});

module.exports = router;
