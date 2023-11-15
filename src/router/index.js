import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/products',
    name: 'products',
    component: () => import('@/views/pages/Products.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  // {
  //   path: '/products/:id',
  //   name: 'product-details',
  //   component: () => import('@/views/pages/ProductDetails.vue'),
  //   meta: {
  //     requiresAuth: true,
  //   },
  // },
  {
    path: '/account-settings',
    name: 'pages-account-settings',
    component: () => import('@/views/pages/account-settings/AccountSettings.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/pages/Login.vue'),
    meta: {
      layout: 'blank',
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/pages/Register.vue'),
    meta: {
      layout: 'blank',
      requiresAuth: false,
    },
  },
  {
    path: '/error-404',
    name: 'error-404',
    component: () => import('@/views/Error.vue'),
    meta: {
      layout: 'blank',
      requiresAuth: false,
    },
  },
  {
    path: '*',
    redirect: 'error-404',
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  const { isUserAuthenticated } = store.getters
  if (to.name === 'login' && isUserAuthenticated) {
    return router.push({ path: 'dashboard' })
  }
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isUserAuthenticated) {
      return router.replace({ path: 'login' })
    }

    return next()
  }

  return next()
})

export default router
