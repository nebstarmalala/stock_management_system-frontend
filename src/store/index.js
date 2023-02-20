import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)
export const AUTHENTICATE_USER = 'AUTHENTICATE_USER'
export const CLEAR_USER = 'CLEAR_USER'
export const TOGGLE_DARK_THEME = 'TOGGLE_DARK_THEME'
export const SET_AUTO_LOGOUT_TIME = 'SET_AUTO_LOGOUT_TIME'
export const TOGGLE_AUTO_LOGOUT = 'TOGGLE_AUTO_LOGOUT'

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    appName: process.env.VUE_APP_NAME,
    logo: process.env.VUE_APP_LOGO,
    isUserAuthenticated: false,
    userInfo: {
      name: '',
      email: '',
      permissions: '',
      authenticationToken: '',
    },
    autoLogoutTime: 15,
    meterReadingDate: 25,
    isAutoLogoutEnabled: true,
    isDarkThemeEnabled: false,
  },
  getters: {
    isUserAuthenticated: state => state.isUserAuthenticated,
    userInfo: state => state.userInfo,
    userPermissions: state => state.userInfo.permissions,
    isDarkThemeEnabled: state => state.isDarkThemeEnabled,
    autoLogoutTime: state => state.autoLogoutTime,
    isAutoLogoutEnabled: state => state.isAutoLogoutEnabled,
    shouldRefreshStations: state => state.refreshStations,
    meterReadingDate: state => state.meterReadingDate,
    appName: state => state.appName,
    logo: state => state.logo,
  },
  mutations: {
    [AUTHENTICATE_USER](state, payload) {
      state.isUserAuthenticated = true
      state.userInfo = payload
    },
    [CLEAR_USER](state) {
      state.isUserAuthenticated = false
      state.userInfo = {}
    },
    [SET_AUTO_LOGOUT_TIME](state, payload) {
      state.autoLogoutTime = payload
    },
    [TOGGLE_DARK_THEME](state) {
      state.isDarkThemeEnabled = !state.isDarkThemeEnabled
    },
    [TOGGLE_AUTO_LOGOUT](state) {
      state.isAutoLogoutEnabled = !state.isAutoLogoutEnabled
    },
  },
  actions: {
    authenticateUser({ commit }, payload) {
      commit(AUTHENTICATE_USER, payload)
    },
    clearUser({ commit }) {
      commit(CLEAR_USER)
    },
    setAutoLogoutTime({ commit }, payload) {
      commit(SET_AUTO_LOGOUT_TIME, payload)
    },
    toggleAutoLogout({ commit }) {
      commit(TOGGLE_AUTO_LOGOUT)
    },
    toggleDarkTheme({ commit }) {
      commit(TOGGLE_DARK_THEME)
    },
  },
  modules: {},
})
