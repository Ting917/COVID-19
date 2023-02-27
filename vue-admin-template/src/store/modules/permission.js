import { asyncRoutes, constantRoutes } from '@/router'
import * as HTTP from '@/api/user'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}
/**
 * 后台查询的菜单数据拼装成路由格式的数据
 * @param routes
 */
export function generaMenu(routes, data) {
  data.forEach(item => {
    const menu = {
      path: item.path,
      component: item.component === '#' ? Layout : (resolve) => require([`@/views/${item.component}`], resolve),
      hidden: item.hidden,
      redirect: item.component === '#' ? item.path : null,
      children: [],
      name: item.name,
      meta: item.meta
      // props: item.hidden == true ? true : null
    }
    if (item.children.length > 0) {
      generaMenu(menu.children, item.children)
    }
    routes.push(menu)
  })
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      const loadMenuData = []
      HTTP.getAuthMenu().then((res) => {
        if (res.code === 200) {
          const data = res.result
          Object.assign(loadMenuData, data)
          const tempAsyncRoutes = Object.assign([], asyncRoutes)
          generaMenu(tempAsyncRoutes, loadMenuData)
          let accessedRoutes
          if (roles.includes(0)) {
            accessedRoutes = tempAsyncRoutes || []
          } else {
            accessedRoutes = filterAsyncRoutes(tempAsyncRoutes, roles)
          }
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        } else {
          this.$message.error(res.msg)
        }
      }).catch((err) => {
        sessionStorage.removeItem(location.host + '/coronal' + '/info')
        console.log(err)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
