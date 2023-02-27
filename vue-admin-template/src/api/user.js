import request from '@/utils/request'

// 登录
export function login(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/user/login',
    method: 'post',
    data
  })
}

// 注册
export function register(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/create/user',
    method: 'post',
    data
  })
}

// 更新用户信息
export function updateInfo(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/update/userInfo',
    method: 'post',
    data
  })
}
export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

// 退出
export function logout() {
  return request({
    url: process.env.VUE_APP_BASEURL + '/user/logout',
    method: 'get'
  })
}

// 获取图片验证码
export function getCaptch(params) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/getCaptch',
    method: 'get',
    params
  })
}
// 更新用户头像
export function updateImg(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/update/userImg',
    method: 'post',
    data
  })
}
// 获取侧边栏
export function getAuthMenu() {
  return request({
    url: process.env.VUE_APP_BASEURL + '/getAuthMenu',
    method: 'get'
  })
}