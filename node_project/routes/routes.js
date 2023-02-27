const combineRoutes = require('koa-combine-routers')

// 公共 路由
const PublicRouter = require('./modules/PublicRouter')
// const loginRouter = require('./modules/loginRouter')

module.exports = combineRoutes(PublicRouter)
