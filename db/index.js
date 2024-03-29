// 引入mysql
const mysql = require("mysql");
// 建立一个连接池
const db = mysql.createConnection({
  host: "localhost", // 数据库的IP地址(本地的或者是云服务器的都可以)
  port: 3306,
  user: "root",
  password: "123456",
  database: "book_database", //指定要操作哪个数据库
})
db.connect((err) => {
  if(err) return
})
// 将文件暴露出去
module.exports = db