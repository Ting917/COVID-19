const Koa = require('koa')
const koaBody = require('koa-body')
const cors = require('@koa/cors')
const jsonutil = require('koa-json')
const helmet = require('koa-helmet')
const compose = require('koa-compose')
const koaJwt = require('koa-jwt') //路由权限控制

const router = require('./routes/routes')
const error = require('./config/error')

const app = new Koa()

//秘钥
const jwtSecret = 'MathowPro'
const middleware = compose([
  cors(),
  jsonutil({ pretty: false, param: 'pretty' }),
  helmet(),
  koaBody({
    // multipart 解析文件上传
    multipart: true,
    // 限制文件大小 5M
    formidable: {
      keepExtensions: true,
      maxFieldsSize: 5 * 1024 * 1024
    },
    // 接受错误
    onError: (err) => {
      console.log('koabody TCL: err', err)
    }
  }),
  error
])
app.use(middleware)
app.use(router())
app.use(koaJwt({secret:jwtSecret}).unless({
  path:[/^\/login/]
}))

// 监听端口
app.listen(4004, () => {
  console.log('服务器已启动，http://localhost:4004')
})
