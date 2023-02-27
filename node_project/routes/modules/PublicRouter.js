const Router = require('koa-router')
const db = require('../../model/db')
const jwt = require('jwt-simple')
const svgCaptcha = require('svg-captcha') // 生成图片验证码插件

const router = new Router()

const jwtSecret = 'testVueNodeProject@MySelf_123'
const tokenExpiresTime = 1000 * 60 * 60 * 6 // token 有效期六小时
// router.prefix('/public')
// 获取图片验证码
router.get('/getCaptch', async (ctx) => {
  var msg = ''
  var code = 401
  let captch = {} // 存储图片验证码
  try{
    const cap = svgCaptcha.create({
      size: 4, // 验证码长度
      width: 100,
      height: 40,
      fontSize: 45,
      ignoreChars: '0oO1ilI', // 验证码字符中排除 0o1i
      noise: 2, // 干扰线条的数量
      color: true, // 验证码的字符是否有颜色，默认没有，如果设定了背景，则默认有
      // background: '#ecf5ff' // 验证码图片背景颜色
    })
    
    let img = cap.data // 验证码
    let text = cap.text.toLowerCase() // 验证码字符，忽略大小写
    ctx.type = 'html'
    captch.captch = `${img}`
    // 验证码生成后存入数据库并返回唯一id
    var sql = "insert into captch(captch, create_time) VALUES ('" + text + "', '" + ctx.query.create_time + "');select last_insert_id()"
    let results = await db(sql)
    if(results[0] && results[0].affectedRows > 0){
      captch.id = results[1][0]['last_insert_id()']
      code = 200
      msg = '验证码生成成功'
    } else {
      msg = '验证码生成失败'
    }
  }catch (err){
    msg = '状态异常, 请稍后再试'
  }
  ctx.body = {
    msg: msg,
    code: code,
    captch: captch
  }
})
// 登录
router.post('/user/login', async (ctx) => {
  var code = 400
  var msg = ''
  var temp = {}
  let firstSql = "select * from captch where id = " + ctx.request.body.captchID + " and captch = '" + ctx.request.body.captch + "'"
  let FirstResults = await db(firstSql)
  if(FirstResults.length > 0) {
    var baseSql = "update login_user_info set last_login_time = '" + ctx.request.body.login_time + "', login_state = true where id = ( select user_id from (select id as user_id from login_user_info where ( account = '"
    var sql = baseSql + ctx.request.body.username + "' or email = '" + ctx.request.body.username + "') and password = '" + ctx.request.body.password + "' and is_deleted = false) as a )"
    let results = await db(sql)
    let token = null
    if(results.affectedRows === 0){
      msg = '您输入的用户名或密码不正确'
    } else {
      var sql2 = "SELECT * from login_user_info where is_deleted = false and account = '" + ctx.request.body.username + "' and login_state = true"
      let finall = await db(sql2)
      // 登陆成功生成token
      let payload = { // 在token中携带所需身份信息
        exp: Date.now() + tokenExpiresTime, // 过期时间
        id: finall[0].id,
        name: finall[0].account,
        authority: finall[0].authority,
        roles: finall[0].roles // 0：管理员 1：学生 2：老师
      }
      token = jwt.encode(payload, jwtSecret)
      let { id, account, email, phone, sex, authority, roles, last_login_time, state, img_url } = finall[0] || {}
      temp = { id, account, email, phone, sex, authority, roles, last_login_time, state, img_url }
      temp.token = token
      msg = '登陆成功'
      code = 200
    }
  } else {
    code = 500
    msg = '验证码输入错误'
  }
  // 不管登陆成功还是失败都删除该条验证码
  let finalSql = "DELETE FROM captch WHERE id = " + ctx.request.body.captchID
  await db(finalSql)
  ctx.body = {
    msg: msg,
    code: code,
    results: temp
  }
})
// 注册
router.post('/create/user', async (ctx) => {
  var code = 400
  var msg = ''
  let firstSql = "select * from captch where id = " + ctx.request.body.captchID + " and captch = '" + ctx.request.body.captch + "'"
  let FirstResults = await db(firstSql)
  if(FirstResults.length > 0) {
    var baseSql = "INSERT INTO login_user_info(account, password, email, phone, sex, create_time, roles, login_state, authority, is_deleted) SELECT '"
    var sql = baseSql + ctx.request.body.username + "', '" + ctx.request.body.password + "', '" + ctx.request.body.email + "', '" + ctx.request.body.phone + "', " + ctx.request.body.sex + ", '"+ ctx.request.body.register_time + 
      "', 1, false, 4, false FROM dual WHERE NOT EXISTS(SELECT * FROM login_user_info WHERE account = '" + 
      ctx.request.body.username + "' or email = '" + ctx.request.body.email + "')"
    let results = await db(sql)
    if(results.affectedRows > 0){
      code = 200
      msg = '账户注册成功, 请登录'
    } else {
      msg = '账户名或邮箱地址已存在'
    }
  } else {
    code = 500
    msg = '验证码输入错误'
  }
  ctx.body = {
    code: code,
    msg: msg
  }
})
// 更新用户信息
router.post('/update/userInfo', async (ctx) => {
  var msg = ''
  var code = 401
  let token = ''
  let payload
  try{
    payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "update login_user_info set password = '" + (ctx.request.body.newPwd === '' ? ctx.request.body.password : ctx.request.body.newPwd) + "', last_edit_time = '" + 
        ctx.request.body.last_login_time + "', account = '" + ctx.request.body.account + "', email = '" + ctx.request.body.email + "', phone = '" + ctx.request.body.phone + "', sex = " 
        + ctx.request.body.sex + " where id = " + ctx.request.body.id + " and password = '" + ctx.request.body.password + "' and is_deleted = false and login_state = true"
        let results = await db(sql)
      if(results.affectedRows > 0){
        // 生成新的token，仅过期时间、名、邮箱、密码可改变
        payload.exp = Date.now() + tokenExpiresTime
        payload.name = ctx.request.body.account
        token = jwt.encode(payload, jwtSecret)
        msg = '信息修改成功'
        code = 200
      } else {
        code = 400
        msg = '密码错误，请重试'
        token = ''
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
    token = ''
  }
  ctx.body = {
    msg: msg,
    code: code,
    token
  }
})
// 退出
router.get('/user/logout', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "update login_user_info set login_state = false where account = '" + payload.name + "'"
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '退出成功'
      } else {
        msg = '当前状态异常, 请重新登录'
      }
    }
  }catch (err){
    msg = '当前状态异常, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 上传头像
router.post('/update/userImg', async (ctx) => {
  var code = 400
  var msg = ''
  let payload
  try{
    payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "update login_user_info set img_url = '" + ctx.request.body.imageBase64Str + "', last_edit_time = '" + 
        ctx.request.body.update_time + "' where id = " + payload.id + " and is_deleted = false and login_state = true"
      let results = await db(sql)
      if(results.affectedRows > 0){
        msg = '头像修改成功'
        code = 200
      } else {
        code = 400
        msg = '头像修改失败，请重试'
        token = ''
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
    token = ''
  }
  ctx.body = {
    code: code,
    msg: msg
  }
})
// 获取动态路由（侧边栏）数据
router.get('/getAuthMenu', async (ctx) => {
  var msg = ''
  var code = 401
  let result = []
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      // 1.查询外层父路由
      let sql = "select * from router where component = '#'"
      if(payload.roles === 0) {
        // 管理员有所有父路由
      } else { // 普通用户有部分功能
        sql += " and type = " + payload.roles
      }
      let results = await db(sql)
      if (results.length > 0) {
        // 2.查询子路由，并在父路由下添加子路由
        let sql2 = "select * from router where component != '#'"
        switch (payload.roles) {
          case 0:
            // 管理员
            break
          case 1:
            // 普通用户
            sql2 += " and type = " + payload.roles
            break  
        }
        let results2 = await db(sql2)
        if (results2.length > 0) {
          // 路由格式数据处理
          results.forEach(item => {
            item.hidden = item.hidden === 1 ? true : false
            item.children = []
            item.meta = {
              icon: item.icon,
              title: item.title
            }
            delete item.title
            delete item.icon
            delete item.parent
            delete item.id
            delete item.type
            results2.forEach(x => {
              if (x.parent === item.path) {
                x.hidden = x.hidden === 1 ? true : false
                x.children = []
                x.meta = {
                  icon: x.icon,
                  title: x.title
                }
                delete x.title
                delete x.icon
                delete x.parent
                delete x.id
                delete x.type
                item.children.push(x)
              }
            })
          })
          result = results
          code = 200
          msg = '路由查询成功'
        }
      } else {
        msg = '您没有权限登录该系统，请联系管理员'
      }
    }
  }catch (err){
    msg = '当前状态异常, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code,
    result
  }
})

// 1.主功能-用户管理
// 查询用户
router.post('/user/search', async (ctx) => {
  var code = 400
  var msg = ''
  let result = []
  let total = 0
  let payload
  try{
    payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "SELECT id, account, email, phone, sex, roles, create_time FROM login_user_info where is_deleted = false"
      if(![undefined, null, ''].includes(ctx.request.body.account)) {
        sql += " and account = '" + ctx.request.body.account + "'"
      }
      if(![undefined, null, ''].includes(ctx.request.body.email)) {
        sql += " and email = '" + ctx.request.body.email + "'"
      }
      if(![undefined, null, ''].includes(ctx.request.body.create_time)) {
        if(ctx.request.body.create_time.length > 0) {
          sql += " and create_time >= '" + ctx.request.body.create_time[0] + "' and create_time <= '" + ctx.request.body.create_time[1] + "'"
        }
      }
      if(![undefined, null, ''].includes(ctx.request.body.roles)) {
        sql += " and roles = " + ctx.request.body.roles
      }
      if(![undefined, null, ''].includes(ctx.request.body.sex)) {
        sql += " and sex = " + ctx.request.body.sex
      }
      console.log(sql)
      let results = await db(sql)
      code = 200
      msg = '查询成功'
      if(results.length > 0){
        total = results.length
        if(ctx.request.body.pageNumber && ctx.request.body.pageSize) {
          sql += " limit " + (ctx.request.body.pageNumber - 1) * ctx.request.body.pageSize + "," + ctx.request.body.pageSize
          let results2 = await db(sql)
          result = results2
        } else {
          result = results
        }
      } else {
        result = results
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
    token = ''
  }
  ctx.body = {
    code: code,
    msg: msg,
    total: total,
    result
  }
})
// 新增用户
router.post('/user/add', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var baseSql = "INSERT INTO login_user_info(account, password, email, phone, sex, create_time, roles, login_state, authority, is_deleted) SELECT '"
      var sql = baseSql + ctx.request.body.account + "', '" + ctx.request.body.password + "', '" + ctx.request.body.email + "', '" + ctx.request.body.phone + "', " + ctx.request.body.sex + ", '"+ ctx.request.body.register_time + 
        "', " + ctx.request.body.roles + ", false, 4, false FROM dual WHERE NOT EXISTS(SELECT * FROM login_user_info WHERE account = '" + 
        ctx.request.body.account + "' or email = '" + ctx.request.body.email + "')"
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '用户创建成功'
      } else {
        msg = '用户名或邮箱地址已存在，创建失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 修改用户信息
router.post('/user/update', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = ''
      if(ctx.request.body.type === 0) { // 修改密码
        sql = "update login_user_info set password = '" + ctx.request.body.newPwd + "',"
      } else {
        // 不修改密码
        sql = "update login_user_info set"
      }
      let secondSql = " last_edit_time = '" + ctx.request.body.update_time + "', account = '" + ctx.request.body.account + "', email = '" + ctx.request.body.email + "', phone = '" + ctx.request.body.phone + "', sex = " 
        + ctx.request.body.sex + ", roles = " + ctx.request.body.roles + " where id = " + ctx.request.body.id + " and is_deleted = false"
      let final = " and password = '" + ctx.request.body.password + "'"
      sql += secondSql
      if(ctx.request.body.type === 0) {
        sql += final
      }
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '修改成功'
      } else {
        msg = '修改失败，请重试'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 删除用户数据
router.get('/user/delete', async (ctx) => {
  let results = ''
  var code = 401
  var msg = ''
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "UPDATE login_user_info SET is_deleted = true, last_edit_time = '" + ctx.query.change_time + "' WHERE id = " + ctx.query.id
      results = await db(sql)
      if(results.affectedRows > 0) {
        msg = '删除成功'
        code = 200
      } else {
        msg = '删除失败'
      }
    }
  }catch (err){
    results = ''
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    code: code,
    msg: msg,
    results
  }
})

// 2.主功能疫情管理
// 2.疫情管理 公共查询 区分不同状态
router.post('/epidemic/trace/search', async (ctx) => {
  var code = 400
  var msg = ''
  let result = []
  let total = 0
  let payload
  try{
    payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "SELECT * FROM trace where is_deleted = false"
      switch(ctx.request.body.type) {
        case 0:
          // 密接者
          sql += " and is_traced = true"
          break
        case 1:
          // 确诊
          sql += " and is_patiented = true"
          break
        case 2:
          // 治愈
          sql += " and is_cured = true"
          break
        case 3:
          // 死亡
          sql += " and is_deathed = true"
          break
        case 4:
          // 智能判断，查询密接和确诊患者数据
          sql += " and ( is_traced = true or is_patiented = true )"
          break
        case 5:
          // 远程搜索
          sql = "SELECT address FROM trace where is_deleted = false and address like '%" + ctx.request.body.address + "%'"
          break
      }
      if(![undefined, null, ''].includes(ctx.request.body.name)) {
        sql += " and name = '" + ctx.request.body.name + "'"
      }
      if(ctx.request.body.type !== 5) {
        if(![undefined, null, ''].includes(ctx.request.body.address)) {
          sql += " and address = '" + ctx.request.body.address + "'"
        }
      }
      if(![undefined, null, ''].includes(ctx.request.body.start_time)) {
        if(ctx.request.body.start_time.length > 0) {
          sql += " and start_time >= '" + ctx.request.body.start_time[0] + "' and start_time <= '" + ctx.request.body.start_time[1] + "'"
        }
      }
      // 住院时间
      if(![undefined, null, ''].includes(ctx.request.body.hospital_time)) {
        if(ctx.request.body.hospital_time.length > 0) {
          sql += " and hospital_time >= '" + ctx.request.body.hospital_time[0] + "' and hospital_time <= '" + ctx.request.body.hospital_time[1] + "'"
        }
      }
      if(![undefined, null, ''].includes(ctx.request.body.sex)) {
        sql += " and sex = " + ctx.request.body.sex
      }
      sql += " order by update_time asc"
      console.log(sql)
      let results = await db(sql)
      code = 200
      msg = '查询成功'
      if(results.length > 0){
        total = results.length
        if(ctx.request.body.pageNumber && ctx.request.body.pageSize) {
          sql += " limit " + (ctx.request.body.pageNumber - 1) * ctx.request.body.pageSize + "," + ctx.request.body.pageSize
          let results2 = await db(sql)
          result = results2
        } else {
          result = results
        }
      } else {
        result = results
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
    token = ''
  }
  ctx.body = {
    code: code,
    msg: msg,
    total: total,
    result
  }
})
// 查询单条数据详情
router.get('/epidemic/trace/seachOne', async (ctx) => {
  let result = ''
  var code = 401
  var msg = ''
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "SELECT * FROM trace where is_deleted = false and id = " + ctx.query.id
      result = await db(sql)
      if(result.length > 0) {
        msg = '查找成功'
        code = 200
      } else {
        msg = '数据查找失败'
      }
    }
  }catch (err){
    results = ''
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    code: code,
    msg: msg,
    result: result[0]
  }
})
// 密接转确诊
router.post('/epidemic/trace/toPatiented', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "update trace set infection = '" + ctx.request.body.infection + "', hospital_time = '" + ctx.request.body.hospital_time + "', symptom = '" + ctx.request.body.symptom + 
        "', hospital = '" + ctx.request.body.hospital + "', is_weight = " + ctx.request.body.is_weight + ", remarks = '" + ctx.request.body.remarks + "', update_user = '" + ctx.request.body.update_user +
        "', update_time = '" + ctx.request.body.update_time + "', is_patiented = true, is_traced = false where id = " + ctx.request.body.id + " and is_traced = true"
      console.log(sql)
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '密接转确诊成功'
      } else {
        msg = '密接转确诊失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 新增密接者数据
router.post('/epidemic/trace/add', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "INSERT INTO trace(name, number, sex, age, source, address, isolate_address, phone, start_time, update_user, update_time, is_traced, is_deleted) VALUES('" + ctx.request.body.name + "', '" + ctx.request.body.number + "', "
       + ctx.request.body.sex + ", " + ctx.request.body.age + ", '" + ctx.request.body.source + "', '" + ctx.request.body.address + "', '" + ctx.request.body.isolate_address + "', '" + ctx.request.body.phone + "', '" + ctx.request.body.start_time + "', '" + 
       ctx.request.body.create_user + "', '" + ctx.request.body.create_time + "', true, false)"
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '创建成功'
      } else {
        msg = '创建失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 新增确诊患者数据
router.post('/epidemic/patient/add', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "INSERT INTO trace(name, number, sex, age, address, phone, infection, hospital_time, symptom, hospital, is_weight, remarks,  update_user, update_time, is_patiented, is_deleted) VALUES('" + 
        ctx.request.body.name + "', '" + ctx.request.body.number + "', " + ctx.request.body.sex + ", " + ctx.request.body.age + ", '" + ctx.request.body.address + "', '" + ctx.request.body.phone + 
        "', '" + ctx.request.body.infection + "', '" + ctx.request.body.hospital_time + "', '" + ctx.request.body.symptom + "', '" + ctx.request.body.hospital + "', " + ctx.request.body.is_weight +
        ", '" + ctx.request.body.remarks + "', '" + ctx.request.body.create_user +"', '" + ctx.request.body.create_time + "', true, false)"
      console.log(sql)
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '创建成功'
      } else {
        msg = '创建失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 查询核酸检测记录
router.post('/epidemic/trace/getCheckInfo', async (ctx) => {
  var code = 400
  var msg = ''
  let result = []
  let total = 0
  let payload
  try{
    payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "SELECT * FROM check_record where is_deleted = false"
      if(![undefined, null, ''].includes(ctx.request.body.name)) {
        sql += " and name = '" + ctx.request.body.name + "'"
      }
      if(![undefined, null, ''].includes(ctx.request.body.sex)) {
        sql += " and sex = '" + ctx.request.body.sex + "'"
      }
      if(![undefined, null, ''].includes(ctx.request.body.check_time)) {
        if(ctx.request.body.check_time.length > 0) {
          sql += " and check_time >= '" + ctx.request.body.check_time[0] + "' and check_time <= '" + ctx.request.body.check_time[1] + "'"
        }
      }
      sql += " order by check_time desc"
      console.log(sql)
      let results = await db(sql)
      code = 200
      msg = '查询成功'
      if(results.length > 0){
        total = results.length
        if(ctx.request.body.pageNumber && ctx.request.body.pageSize) {
          sql += " limit " + (ctx.request.body.pageNumber - 1) * ctx.request.body.pageSize + "," + ctx.request.body.pageSize
          let results2 = await db(sql)
          result = results2
        } else {
          result = results
        }
      } else {
        result = results
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
    token = ''
  }
  ctx.body = {
    code: code,
    msg: msg,
    total: total,
    result
  }
})
// 新增检测记录
router.post('/epidemic/trace/createCheck', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "INSERT INTO check_record(name, sex, contact, address, area, report, acid, ct, check_time, create_time, create_user, is_deleted) VALUES('" + 
        ctx.request.body.name + "', '" + ctx.request.body.sex + "', '" + ctx.request.body.contact + "', '" + ctx.request.body.address + "', '" + ctx.request.body.area + "', '" + ctx.request.body.imageBase64 + "', " + ctx.request.body.acid + ", " + ctx.request.body.ct + ", '" + ctx.request.body.check_time + 
        "', '" + ctx.request.body.create_time + "', '" + ctx.request.body.create_user + "', false)"
      console.log(sql)
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '创建成功'
      } else {
        msg = '创建失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 更新检测信息
router.post('/epidemic/check/updateInfo', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "update check_record set name = '" + ctx.request.body.name + "', area = '" + ctx.request.body.area + "', contact = '" + ctx.request.body.contact + "', sex ='" + ctx.request.body.sex + "', address = '" + ctx.request.body.address + "', report = '" + ctx.request.body.report
        + "', acid = " + ctx.request.body.acid + ", ct = " + ctx.request.body.ct + ", check_time = '" + ctx.request.body.check_time + 
        "', update_user = '" + ctx.request.body.update_user + "', update_time = '" + ctx.request.body.update_time + "' where id = " + ctx.request.body.id 
        let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '修改成功'
      } else {
        msg = '修改失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 更新病患部分信息、更新密接者隔离信息
router.post('/epidemic/trace/updateInfo', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "update trace set "
      if(ctx.request.body.type === 0) {
        sql += "source = '" + ctx.request.body.source +  "', start_time = '" + ctx.request.body.start_time + "', isolate_address = '" + ctx.request.body.isolate_address + "'"
      } else {
        sql += "infection = '" + ctx.request.body.infection + "', hospital_time = '" + ctx.request.body.hospital_time + "', symptom = '" + ctx.request.body.symptom + 
        "', hospital = '" + ctx.request.body.hospital + "', is_weight = " + ctx.request.body.is_weight + ", remarks = '" + ctx.request.body.remarks + "'"
      }
      sql += ", update_user = '" + ctx.request.body.update_user + "', update_time = '" + ctx.request.body.update_time + "' where id = " + ctx.request.body.id 
      console.log(sql)
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '修改成功'
      } else {
        msg = '修改失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 确诊转治愈、确诊转死亡
router.post('/epidemic/trace/toCureOrDeath', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "update trace set "
      if(ctx.request.body.type === 0) {
        sql += "leave_time = '" + ctx.request.body.leave_time + "', situation = '" + ctx.request.body.situation + "'"
      } else {
        sql += "death_time = '" + ctx.request.body.death_time + "', death_note = '" + ctx.request.body.death_note + "'"
      }
      sql += ", update_user = '" + ctx.request.body.update_user + "', update_time = '" + ctx.request.body.update_time + "', is_cured = " 
          + (ctx.request.body.type === 0) + ", is_deathed = " + (ctx.request.body.type === 1) + ", is_patiented = false where id = " + ctx.request.body.id
      console.log(sql)
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = ctx.request.body.type === 0 ? '转治愈成功' : '转死亡成功'
      } else {
        msg = ctx.request.body.type === 0 ? '转治愈失败' : '转死亡失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 密接转隔离完成
router.get('/epidemic/trace/toIsolated', async (ctx) => {
  let result = ''
  var code = 401
  var msg = ''
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "update trace set update_user = '" + ctx.query.update_user + "', update_time = '" + ctx.query.update_time + "', is_cured = true, is_traced = false where id = " + ctx.query.id
      console.log(sql)
      result = await db(sql)
      if(result.affectedRows > 0) {
        code = 200
        msg = '转治愈成功'
      } else {
        msg = '转治愈失败'
      }
    }
  }catch (err){
    result = ''
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    code: code,
    msg: msg,
    result: result
  }
})
// 首页数据展示功能
// 查询确诊数据
router.post('/dashboard/search', async (ctx) => {
  var code = 400
  var msg = ''
  let result = []
  let temp = {
    patient: [],
    trace: [],
    cure: [],
    death: []
  }
  let results = []
  let total = [] // 存储饼图数据
  let payload
  try{
    payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "SELECT * FROM trace where is_deleted = false"
      if(![undefined, null, ''].includes(ctx.request.body.time)) {
        if(ctx.request.body.time.length > 0) {
          sql += " and update_time >= '" + ctx.request.body.time[0] + "' and update_time <= '" + ctx.request.body.time[1] + "'"
        }
      }
      results = await db(sql)
      code = 200
      msg = '查询成功'
      if(results.length > 0) {
        let count = 0
        let count2 = 0
        let count3 = 0
        let count4 = 0
        results.forEach(item => {
          if (item.is_patiented) { // 确诊
            count++
            temp.patient.push(item) 
          } else if (item.is_traced) { // 密接
            count2++
            temp.trace.push(item)
          } else if (item.is_cured) { // 治愈
            count3++
            temp.cure.push(item)
          } else { // 死亡
            count4++
            temp.death.push(item)
          }
        })
        let all = count + count2 + count3 + count4
        total.push({ value: count / ( all === 0 ? 1 : all) * 100, name: '确诊' })
        total.push({ value: count2 / ( all === 0 ? 1 : all) * 100, name: '密接' })
        total.push({ value: count3 / ( all === 0 ? 1 : all) * 100, name: '治愈' })
        total.push({ value: count4 / ( all === 0 ? 1 : all) * 100, name: '死亡' })
        result = temp
      } else {
        result = results
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
    token = ''
  }
  ctx.body = {
    code: code,
    msg: msg,
    total: total,
    result: result,
    all: results
  }
})

// 疫苗管理功能
// 查询疫苗预约信息
router.post('/epidemic/appointmentInfo/search', async (ctx) => {
  var code = 400
  var msg = ''
  let result = []
  let total = 0
  let payload
  try{
    payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "SELECT * FROM vaccination where delete_flag = false"
      if(![undefined, null, ''].includes(ctx.request.body.name)) {
        sql += " and name = '" + ctx.request.body.name + "'"
      }
      if(![undefined, null, ''].includes(ctx.request.body.vaccines_number)) {
        sql += " and vaccines_number = '" + ctx.request.body.vaccines_number + "'"
      }
      if(![undefined, null, ''].includes(ctx.request.body.sex)) {
        sql += " and sex = '" + ctx.request.body.sex + "'"
      }
      // if(![undefined, null, ''].includes(ctx.request.body.appointment_time)) {
      //   if(ctx.request.body.appointment_time.length > 0) {
      //     sql += " and appointment_time >= '" + ctx.request.body.appointment_time[0] + "' and appointment_time <= '" + ctx.request.body.appointment_time[1] + "'"
      //   }
      // }
      console.log(sql)
      let results = await db(sql)
      code = 200
      msg = '查询成功'
      if(results.length > 0){
        total = results.length
        if(ctx.request.body.pageNumber && ctx.request.body.pageSize) {
          sql += " limit " + (ctx.request.body.pageNumber - 1) * ctx.request.body.pageSize + "," + ctx.request.body.pageSize
          let results2 = await db(sql)
          result = results2
        } else {
          result = results
        }
      } else {
        result = results
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
    token = ''
  }
  ctx.body = {
    code: code,
    msg: msg,
    total: total,
    result
  }
})
// 新增预约信息
router.post('/epidemic/appointmentInfo/add', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "INSERT INTO vaccination(name, area, conditions, sex, allergy, address, inoculation_site, inoculation_area, inoculation_address, vaccines_name, vaccines_number, vaccines_type, number, vaccines_level, create_time, create_user, state, delete_flag) VALUES('" + 
        ctx.request.body.name + "', '" + ctx.request.body.area + "', '"  + ctx.request.body.conditions + "', '" + ctx.request.body.sex + "', '" + ctx.request.body.allergy + "', '" + ctx.request.body.address + "', '" + ctx.request.body.inoculation_site + "', '" + ctx.request.body.inoculation_area + 
        "', '" + ctx.request.body.inoculation_address + "', '" + ctx.request.body.vaccines_name + "', '" +  ctx.request.body.vaccines_number + "', '" + ctx.request.body.vaccines_type + "', " + ctx.request.body.number + ", '" + ctx.request.body.vaccines_level + "', '" + 
        ctx.request.body.create_time + "', '" + ctx.request.body.create_user + "', '已预约', false)"
      console.log(sql)
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '预约成功'
      } else {
        msg = '预约失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 查询单条数据详情
router.get('/epidemic/appointmentInfo/seachOne', async (ctx) => {
  let result = ''
  var code = 401
  var msg = ''
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      let sql = "SELECT * FROM vaccination where delete_flag = false and id = " + ctx.query.id
      result = await db(sql)
      if(result.length > 0) {
        msg = '查找成功'
        code = 200
      } else {
        msg = '数据查找失败'
      }
    }
  }catch (err){
    results = ''
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    code: code,
    msg: msg,
    result: result[0]
  }
})
// 删除预约信息
router.get('/epidemic/appointmentInfo/delete', async (ctx) => {
  let results = ''
  var code = 401
  var msg = ''
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "UPDATE vaccination SET delete_flag = true WHERE id = " + ctx.query.id
      results = await db(sql)
      if(results.affectedRows > 0) {
        msg = '删除成功'
        code = 200
      } else {
        msg = '删除失败'
      }
    }
  }catch (err){
    results = ''
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    code: code,
    msg: msg,
    results
  }
})
// 修改预约信息
router.post('/epidemic/appointmentInfo/update', async (ctx) => {
  var msg = ''
  var code = 401
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "update vaccination set name = '" + ctx.request.body.name + "', area = '" + ctx.request.body.area + "', conditions = '" + ctx.request.body.conditions + "', sex ='" + ctx.request.body.sex + "', allergy = '" + ctx.request.body.allergy + "', address = '" + ctx.request.body.address + "', inoculation_site = '" + ctx.request.body.inoculation_site
        + "', inoculation_area = '" + ctx.request.body.inoculation_area + "', inoculation_address = '" + ctx.request.body.inoculation_address + "', vaccines_name = '" + ctx.request.body.vaccines_name + "', vaccines_number = '" + ctx.request.body.vaccines_number + "', vaccines_type = '" + ctx.request.body.vaccines_type + "', number = " + ctx.request.body.number
        + ", vaccines_level = '" + ctx.request.body.vaccines_level + "', update_user = '" + ctx.request.body.update_user + 
        "', update_time = '" + ctx.request.body.update_time + "' where id = " + ctx.request.body.id 
      let results = await db(sql)
      if(results.affectedRows > 0){
        code = 200
        msg = '修改成功'
      } else {
        msg = '修改失败'
      }
    }
  }catch (err){
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    msg: msg,
    code: code
  }
})
// 删除检测信息
router.get('/epidemic/check/delete', async (ctx) => {
  let results = ''
  var code = 401
  var msg = ''
  try{
    let payload = jwt.decode(ctx.request.header.token, jwtSecret)
    if (payload) {
      var sql = "UPDATE check_record SET is_deleted = true WHERE id = " + ctx.query.id
      results = await db(sql)
      if(results.affectedRows > 0) {
        msg = '删除成功'
        code = 200
      } else {
        msg = '删除失败'
      }
    }
  }catch (err){
    results = ''
    msg = '登陆超时, 请重新登录'
  }
  ctx.body = {
    code: code,
    msg: msg,
    results
  }
})
module.exports = router
