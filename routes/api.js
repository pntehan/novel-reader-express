var express = require('express');
var router = express.Router();
const db = require('../db')

function toBase64(books) {
  for (let i=0; i<books.length; i++) {
      books[i].img = Buffer.from(books[i].img).toString('base64')
  }
  return books
}

/* book part */
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
      db.query("select * from comment where book_id="+books[0].id+" order by create_time limit 10", (err, comments) => {
        res.send({data: books[0], data_list: like_books, comment_list: comments})
      })
    })
  })
});

router.post('/getSearchList', function(req, res, next) {
  let word = "%" + req.body.searchWord + "%"
  // 获取类别信息
  let sql = "select * from book where name like '"+ word +"' or author like '"+ word +"' or intro like '"+ word +"'"
  console.log(sql)
  db.query(sql, (err, books) => {
    books = toBase64(books)
    res.send({data: books})
  })
});

router.post('/getCategorybooks', function(req, res, next) {
  let name = req.body.name
  // 获取类别信息
  db.query("select * from book where category='"+name+"'", (err, books) => {
    books = toBase64(books)
    res.send({data: books})
  })
});

router.post('/getShelfbooks', function(req, res, next) {
  let user_id = req.body.user_id
  let group_name = req.body.group_name
  // 获取类别信息
  db.query("select book_id from shelf where user_id="+user_id+" and group_name='"+group_name+"'", (err, book_ids) => {
    let sql = "select * from book where id in (?)"
    let ids = []
    for (let i=0; i<book_ids.length; i++) {
      ids.push(book_ids[i].book_id)
    }
    db.query(sql, [ids], (err, books) => {
      if (err) throw err
      books = toBase64(books)
      res.send({data: books})
    })
  })
});

router.post('/addShelf', function(req, res, next) {
  let user_id = parseInt(req.body.user_id, 10)
  let book_id = req.body.book_id
  let group_name = req.body.group_name
  let update_time = new Date()
  // 获取类别信息
  let sql = "insert into shelf (user_id, book_id, update_time, group_name) values (?, ?, ?, ?)"
  let values = [user_id, book_id, update_time, group_name]
  db.query(sql, values, (err) => {
    if (err) {
      console.log(err)
      res.send({status: 400})
    }
    else {
      res.send({status: 200})
    }
  })
});

router.post('/getChapterList', function(req, res, next) {
  let book_id = parseInt(req.body.id, 10)
  // 获取类别信息
  db.query("select id, name from chapter where book_id="+book_id, (err, chapter_list) => {
    let chapter_list_sorted = chapter_list.sort((a, b) => {
      let numA = a.id.split("_")[1]
      let numB = b.id.split("_")[1]
      return numA - numB
    })
    res.send({data: chapter_list_sorted})
  })
});

router.post('/getChapter', function(req, res, next) {
  let book_id = parseInt(req.body.book_id, 10)
  let chapter_id = parseInt(req.body.chapter_id, 10)
  // 获取类别信息
  db.query("select name, content from chapter where id='"+book_id+"_"+chapter_id+"'", (err, chapter_list) => {
    res.send({data: {title: chapter_list[0].name, content: chapter_list[0].content}})
  })
});

// user part
router.post('/userLogin', function(req, res, next) {
  let email = req.body.email
  let password = req.body.password
  // 对比用户信息
  db.query("select * from user where email='"+email+"'", (err, users) => {
    if (err) throw err
    if (users.length > 0) {
      if (users[0].password == password) {
        res.send({status: 200, data: users[0]})
      }
      else {
        res.send({status: 400})
      }
    }
    else {
      res.send({status: 400})
    }
  })
});

router.post('/userRegister', function(req, res, next) {
  let name = req.body.name
  let email = req.body.email
  let password = req.body.password
  // 对比用户信息
  db.query("select * from user where email='"+email+"'", (err, users) => {
    if (err) throw err
    if (users.length > 0) {
      res.send({status: 300, msg: '该邮箱已被使用！'})
    }
    else {
      // 进行注册
      console.log("insert into user (name, email, password, is_admin) values ('"+name+"', '"+email, "', '"+password+"', 0")
      db.query("insert into user (name, email, password, is_admin) values ('"+name+"', '"+email, "', '"+password+"', 0", (err) => {
        if (err) {
          res.send({status: 500})
        }
        else {
          res.send({status: 200})
        }
      })
    }
  })
});


module.exports = router;
