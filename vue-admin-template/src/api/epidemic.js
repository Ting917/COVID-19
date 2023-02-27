import request from '@/utils/request'

// 获取所有密接者数据
export function getList(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/search',
    method: 'post',
    data
  })
}
// 创建密接者数据
export function createUser(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/add',
    method: 'post',
    data
  })
}
// 获取单条密接者数据
export function getTraceInfo(params) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/seachOne',
    method: 'get',
    params
  })
}
// 密接转确诊
export function toPatiented(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/toPatiented',
    method: 'post',
    data
  })
}
// 创建确诊者数据
export function createPatientUser(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/patient/add',
    method: 'post',
    data
  })
}
// 获取单条密接者数据
export function getCheckInfo(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/getCheckInfo',
    method: 'post',
    data
  })
}
// 创建核酸检测记录
export function createCheck(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/createCheck',
    method: 'post',
    data
  })
}
// 更新病患数据
export function updateInfo(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/updateInfo',
    method: 'post',
    data
  })
}
// 确诊转治愈
export function toCureOrDeath(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/toCureOrDeath',
    method: 'post',
    data
  })
}
// 密接转隔离完成
export function toIsolated(params) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/trace/toIsolated',
    method: 'get',
    params
  })
}


// 创建预约信息
export function createAppointmentInfo(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/appointmentInfo/add',
    method: 'post',
    data
  })
}
// 查询所有预约信息
export function getAppointmentInfo(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/appointmentInfo/search',
    method: 'post',
    data
  })
}
// 获取单条预约数据
export function getAppointmentInfoOne(params) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/appointmentInfo/seachOne',
    method: 'get',
    params
  })
}
// 删除预约信息
export function deleteAppointmentOne(params) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/appointmentInfo/delete',
    method: 'get',
    params
  })
}
// 更新病患数据
export function editAppointmentInfo(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/appointmentInfo/update',
    method: 'post',
    data
  })
}

// 更新检测信息
export function updateCheckInfo(data) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/check/updateInfo',
    method: 'post',
    data
  })
}
// 删除检测信息
export function deleteCheckOne(params) {
  return request({
    url: process.env.VUE_APP_BASEURL + '/epidemic/check/delete',
    method: 'get',
    params
  })
}