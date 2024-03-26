// 引入mysql
const mysql = require("mysql");
// 建立一个连接池
const db = mysql.createPool({
  host: "127.0.0.1", // 数据库的IP地址(本地的或者是云服务器的都可以)
  user: "root",
  password: "123456",
  database: "nodetest", //指定要操作哪个数据库
});
 
// 将文件暴露出去
module.exports = db