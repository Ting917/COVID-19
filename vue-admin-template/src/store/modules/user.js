import { login, logout } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    imgUrl: '', // 存储头像数据，方便换头像后顶部也变更
    isManager: false // 判断用户是不是超级管理员
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_IMGURL: (state, imgUrl) => {
    state.imgUrl = imgUrl
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ISMANAGER: (state, isManager) => {
    state.isManager = isManager
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      login(userInfo).then(response => {
        const { results } = response
        commit('SET_TOKEN', results.token)
        setToken(results.token)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 根据用户角色设置权限
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      const results = JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info'))
      if (results === null) {
        reject('权限验证失败，请重新登录')
      } else {
        commit('SET_ISMANAGER', false)
        if (results.roles === 0) {
          commit('SET_ISMANAGER', true)
        }
        commit('SET_ROLES', [results.roles])
        results.roles = [results.roles]
      }
      resolve(results)
    })
  },
// 更新头像数据
changePicture({ commit, state }, data) {
  return new Promise((resolve, reject) => {
    if (data === null) {
      commit('SET_IMGURL', JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).img_url)
    } else {
      commit('SET_IMGURL', data)
    }
    resolve()
  })
},
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout().then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('SET_ROLES', [])
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

