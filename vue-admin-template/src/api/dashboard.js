import request from '@/utils/request'

// 获取首页全部相关数据
export function getTopData(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/dashboard/search',
    method: 'post',
    data
  })
}
// 创建用户
export function createUser(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/user/add',
    method: 'post',
    data
  })
}
// 修改用户信息
export function updateInfo(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/user/update',
    method: 'post',
    data
  })
}

// 删除用户
export function deleteUser(params) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/user/delete',
    method: 'get',
    params
  })
}
