// 获取当前时间并进行格式化
export function getCurrentTime(type, num = null) {
  var DATE
  if (num !== null) {
    DATE = new Date(num)
  } else {
    DATE = new Date()
  }
  var year = DATE.getFullYear() // 年
  var month = DATE.getMonth() + 1
  month = month >= 10 ? month : ('0' + month)
  var date = DATE.getDate()
  date = date >= 10 ? date : ('0' + date)
  var hour = DATE.getHours()
  hour = hour < 10 ? ('0' + hour) : hour
  var minute = DATE.getMinutes()
  minute = minute < 10 ? ('0' + minute) : minute
  var second = DATE.getSeconds()
  second = second < 10 ? ('0' + second) : second
  var nowdate = ''
  if (type === 1) { // yyyy-MM-dd HH:mm:ss
    nowdate = year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
  } else if (type === 2) { // yyyy-MM-dd
    nowdate = year + '-' + month + '-' + date
  } else if (type === 3) { // yyyy/MM/dd HH:mm:ss
    nowdate = year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
  } else { // HH:mm:ss
    nowdate = hour + ':' + minute + ':' + second
  }
  return nowdate
}
// 冒泡排序（正序反序）
export function sortFunc(tempList, type) {
  for (var i = 0; i < tempList.length - 1; i++) {
    for (var j = 0; j < tempList.length - 1 - i; j++) {
      if (type) {
        if (tempList[j] > tempList[j + 1]) {
          var temp = tempList[j]
          tempList[j] = tempList[j + 1]
          tempList[j + 1] = temp
        }
      } else {
        // 反序
        if (tempList[j] < tempList[j + 1]) {
          var temp2 = tempList[j]
          tempList[j] = tempList[j + 1]
          tempList[j + 1] = temp2
        }
      }
    }
  }
  return tempList
}
// UTC时间转化
export function utc2beijing(date, type) {
  var result = String(date)
  if (result === 'null') {
    return ''
  } else {
    const tem = result.replace('T', ' ').substring(0, 19)
    const timeNumber = new Date(tem).getTime() + 8 * 60 * 60 * 1000
    const year = new Date(timeNumber).getFullYear()
    let month = new Date(timeNumber).getMonth() + 1
    let date = new Date(timeNumber).getDate()
    let hour = new Date(timeNumber).getHours()
    let minute = new Date(timeNumber).getMinutes()
    let second = new Date(timeNumber).getSeconds()
    month = month < 10 ? month = '0' + month : month
    date = date < 10 ? date = '0' + date : date
    hour = hour < 10 ? hour = '0' + hour : hour
    minute = minute < 10 ? minute = '0' + minute : minute
    second = second < 10 ? second = '0' + second : second
    if (type === 2) {
      return year + '-' + month + '-' + date
    } else {
      return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
    }
  }
}
// 设置日期显示格式(n秒前、n分钟前...)
export function setTime(val, type = null) {
  var date = new Date(val)
  var time = date.getTime()
  var current = new Date()
  var curTime = current.getTime()
  if ((curTime - time - 24 * 60 * 60 * 1000) <= 0) {
    var h = parseInt(((curTime - time) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    var m = parseInt(((curTime - time) % (1000 * 60 * 60)) / (1000 * 60))
    var s = ((curTime - time) % (1000 * 60)) / 1000
    if (type === null) {
      val = h === 0 ? m === 0 ? s + '秒前' : m + '分钟前' : h + '小时前'
    } else {
      val = h === 0 ? m === 0 ? s + '秒' : m + '分钟' : h + '小时'
    }
  }
  return val
}
