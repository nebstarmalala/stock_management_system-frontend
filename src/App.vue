<template>
  <component :is="resolveLayout">
    <nprogress-container></nprogress-container>
    <router-view></router-view>
  </component>
</template>

<script>
import { computed } from '@vue/composition-api'
import { mapActions, mapGetters } from 'vuex'
import axios from 'axios'
import NprogressContainer from 'vue-nprogress/src/NprogressContainer'
import { useRouter } from '@/utils'
import LayoutBlank from '@/layouts/Blank.vue'
import LayoutContent from '@/layouts/Content.vue'

export default {
  components: {
    LayoutBlank,
    LayoutContent,
    NprogressContainer,
  },
  computed: {
    ...mapGetters(['isUserAuthenticated', 'isDarkThemeEnabled', 'userInfo']),
  },
  mounted() {
    this.$vuetify.theme.dark = this.isDarkThemeEnabled
    axios.interceptors.response.use(
      response => response,
      error => {
        console.log(error.response.status)
        if (error.response.status === 401) {
          this.clearUser()
          this.$router.push('/login')
        }

        return Promise.reject(error)
      },
    )
  },
  methods: {
    ...mapActions(['clearUser']),
    setAuthHeader() {
      delete axios.defaults.headers.common.Authorization
      if (this.isUserAuthenticated) {
        axios.defaults.headers.common.Authorization = `Bearer ${this.userInfo.authenticationToken}`
      }
    },
  },
  setup() {
    const { route } = useRouter()

    const resolveLayout = computed(() => {
      // Handles initial route
      if (route.value.name === null) return null

      if (route.value.meta.layout === 'blank') return 'layout-blank'

      return 'layout-content'
    })

    return {
      resolveLayout,
    }
  },
}
</script>
