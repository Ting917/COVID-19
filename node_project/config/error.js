module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.error('统一错误信息：' + err)
  }
}
