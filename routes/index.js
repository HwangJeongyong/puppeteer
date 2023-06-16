var express = require('express');
var router = express.Router();

// crawlingSvc.js 파일 import
var crawlingSvc = require('../service/crawlingSvc.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// scraper API 구현 부분
router.post('/scraper', async function(req, res) {
  var result = await crawlingSvc.scraperData(req);
  console.log(JSON.stringify(result));
  res.send(result);
});

module.exports = router;
