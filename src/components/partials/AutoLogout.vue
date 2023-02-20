<template>
  <v-dialog
    v-model="showWarningDialog"
    transition="dialog-bottom-transition"
    max-width="400"
  >
    <v-card>
      <v-toolbar
        color="primary"
        dark
      >
        Are you still there?
      </v-toolbar>
      <v-card-text>
        <p class="pt-2 body-2">
          You will be logged out in a minute. Move your mouse or click to cancel logout
        </p>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          text
          @click="resetTimer()"
        >
          Still here
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import axios from 'axios'

export default {

  data() {
    return {
      events: ['click', 'mousemove', 'mousedown', 'scroll', 'keypress', 'load'],
      showWarningDialog: false,
      warningTimer: null,
      logoutTimer: null,
    }
  },
  computed: {
    ...mapGetters(['autoLogoutTime', 'isAutoLogoutEnabled']),
  },
  watch: {
    isAutoLogoutEnabled(value) {
      if (value) {
        this.setListeners()
      } else {
        this.removeListeners()
      }
    },
  },
  mounted() {
    if (this.isAutoLogoutEnabled) {
      this.setListeners()
    }
  },
  destroyed() {
    this.removeListeners()
  },
  methods: {
    ...mapActions(['clearUser']),
    setTimers() {
      this.warningTimer = setTimeout(this.warningMessage, (this.autoLogoutTime - 1) * 60000)
      this.logoutTimer = setTimeout(this.logout, this.autoLogoutTime * 60000)
    },
    warningMessage() {
      this.showWarningDialog = true
    },
    logout() {
      this.$nprogress.start()
      axios
        .get('auth/admin/logout')
        .then(() => {
          this.$nprogress.done()
          this.clearUser()
          this.removeListeners()
          this.$router.go('/login')
        })
        .catch(error => {
          this.$nprogress.done()
          this.clearUser()
          this.removeListeners()
          this.$router.go('/login')
          this.$notification.error(error.response.data.message)
        })
    },
    setListeners() {
      this.events.forEach(event => {
        window.addEventListener(event, this.resetTimer)
      })
      this.setTimers()
    },
    removeListeners() {
      this.events.forEach(event => {
        window.removeEventListener(event, this.resetTimer)
      })
      clearTimeout(this.warningTimer)
      clearTimeout(this.logoutTimer)
    },
    resetTimer() {
      this.showWarningDialog = false
      clearTimeout(this.warningTimer)
      clearTimeout(this.logoutTimer)
      this.setTimers()
    },
  },

}
</script>
