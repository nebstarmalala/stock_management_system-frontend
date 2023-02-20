import '@/plugins/vue-composition-api'
import '@/styles/styles.scss'
import Vue from 'vue'
import NProgress from 'vue-nprogress'
import axios from 'axios'
import Toast from 'vue-toastification'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'

import 'vue-toastification/dist/index.css'

Vue.config.productionTip = false

Vue.use(NProgress)
Vue.use(Toast)

const nprogress = new NProgress()

axios.defaults.headers.common.Authorization = `Bearer ${store.getters.userInfo.authenticationToken}`
axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL

new Vue({
  router,
  store,
  vuetify,
  nprogress,
  render: h => h(App),
}).$mount('#app')
