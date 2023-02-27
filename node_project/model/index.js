var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'base',
  multipleStatements: true // 支持多条sql语句
});

connection.connect();



module.exports = connection