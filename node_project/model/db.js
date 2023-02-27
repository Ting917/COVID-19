const connection = require('./index')

async function db(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, function (error, results, fields) {
      if (results.length > 0) {
        resolve(results)
      }else {
        resolve(results)
      }
      if (error) {
        reject(error)
      }
    })
  })
}

module.exports = db
