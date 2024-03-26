var express = require('express');
var router = express.Router();

/* GET bookApp listing. */
router.get('/', function(req, res, next) {
  res.render('bookApp/home', { title: '书城' });
});

router.get('/user', function(req, res, next) {
  res.render('bookApp/user', { title: '用户' });
});

router.get('/shelf', function(req, res, next) {
  res.render('bookApp/shelf', { title: '书架' });
});

router.get('/book', function(req, res, next) {
  res.render('bookApp/book', { title: '详情' });
});

router.get('/reader', function(req, res, next) {
  res.render('bookApp/reader', { title: '阅读' });
});

router.get('/listener', function(req, res, next) {
  res.render('bookApp/listener', { title: '听书' });
});

module.exports = router;
