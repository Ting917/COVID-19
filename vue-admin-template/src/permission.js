import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

let cancel = 0
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()
  if (hasToken) {
    if (cancel > 0) {
      next()
    } else {
      if (to.path === '/login') {
        // if is logged in, redirect to the home page
        next({ path: '/dashboard' })
        NProgress.done()
      } else {
        const hasRoles = store.getters.roles && store.getters.roles.length > 0
        // const permission_routes = store.getters.permission_routes && store.getters.permission_routes.length > 0 // 判断是否生成动态路由
        if (hasRoles) {
          if (to.matched.length === 0) {
            next('/404')
          }
          next()
        } else {
          try {
            const { roles } = await store.dispatch('user/getInfo')
            // generate accessible routes map based on roles
            const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
            accessRoutes.push({ path: '*', redirect: '/404', hidden: true }) // 动态加入404页面在最后，在未匹配路由时会跳转404页面，否则为空白页面
            router.addRoutes(accessRoutes)
            store.dispatch('user/changePicture', null) // 设置头像
            next({ ...to, replace: true })
          } catch (error) {
            // remove token and go to login page to re-login
            await store.dispatch('user/resetToken')
            Message.error(error || 'Has Error')
            next(`/login?redirect=${to.path}`)
            NProgress.done()
          }
        }
      }
      cancel++
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
