var express = require('express');
var router = express.Router();
const db = require('../db')

function toBase64(books) {
  for (let i=0; i<books.length; i++) {
      books[i].img = Buffer.from(books[i].img).toString('base64')
  }
  return books
}

/* GET bookApp listing. */
router.get('/index', function(req, res, next) {
  // 初始化主页数据
  db.query("select * from book limit 0, 5", (err, books) => {
    if (err) throw err
    books = toBase64(books)
    res.send({data: books})
  })
});

router.post('/getHomeList', function(req, res, next) {
  let name = req.body[0]
  let start = req.body[1] * 4
  let end = start + 4
  if (name == 'sales') {
    db.query("select * from book order by name limit "+start+", "+end, (err, books) => {
      if (err) throw err
      books = toBase64(books)
      res.send({data: books})
    })
  }
  else if (name == 'recommend') {
    db.query("select * from book order by score limit "+start+", "+end, (err, books) => {
      if (err) throw err
      books = toBase64(books)
      res.send({data: books})
    })
  }
  else {
    db.query("select * from book order by author limit "+start+", "+end, (err, books) => {
      if (err) throw err
      books = toBase64(books)
      res.send({data: books})
    })
  }
});

router.post('/getBook', function(req, res, next) {
  let id = req.body.id
  db.query("select * from book where id="+id, (err, books) => {
    if (err) throw err
    books[0].img = Buffer.from(books[0].img).toString('base64')
    // 查询相关书籍
    db.query("select * from book where category='"+books[0].category+"' limit 0, 4", (err, like_books) => {
      like_books = toBase64(like_books)
      // 查询评论
      db.query("select * from comment order by create_time where book_id="+books[0].id+" limit 0, 10", (err, comments) => {
        res.send({data: books[0], data_list: like_books, comment_list: comments})
      })
    })
  })
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
