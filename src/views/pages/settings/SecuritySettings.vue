<template>
  <v-card
    flat
    class="mt-5"
  >
    <div class="px-3">
      <h1 class="text-center">
        Security settings
      </h1>
      <v-card-text class="pt-5">
        <h2 class="font-weight-medium">
          Password
        </h2>
        <v-form
          ref="form"
          class="mt-6"
          method="post"
          action="/"
          @submit.prevent="updatePassword()"
        >
          <v-row>
            <v-col
              cols="12"
              sm="8"
              md="6"
            >
              <!-- current password -->
              <v-text-field
                v-model="form.current_password"
                :type="isCurrentPasswordVisible ? 'text' : 'password'"
                :append-icon="isCurrentPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                label="Current Password"
                outlined
                dense
                :rules="[v => !!v || 'Current password is required']"
                @click:append="isCurrentPasswordVisible = !isCurrentPasswordVisible"
              ></v-text-field>
              <small
                v-show="form.errors.has('current_password')"
                class="validation-error"
              >{{
                form.errors.get('current_password')
              }}</small>

              <!-- new password -->
              <v-text-field
                v-model="form.password"
                :type="isNewPasswordVisible ? 'text' : 'password'"
                :append-icon="isNewPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                label="New Password"
                outlined
                dense
                hint="Make sure it's at least 8 characters."
                persistent-hint
                :rules="[v => !!v || 'New password is required']"
                @click:append="isNewPasswordVisible = !isNewPasswordVisible"
              ></v-text-field>
              <small
                v-show="form.errors.has('password')"
                class="validation-error"
              >{{
                form.errors.get('password')
              }}</small>

              <!-- confirm password -->
              <v-text-field
                v-model="form.password_confirmation"
                :type="isCPasswordVisible ? 'text' : 'password'"
                :append-icon="isCPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                label="Confirm New Password"
                outlined
                dense
                class="mt-3"
                :rules="[
                  v => !!v || 'Password confirmation is required',
                  v => v === form.password || 'The password confirmation does not match.',
                ]"
                @click:append="isCPasswordVisible = !isCPasswordVisible"
              ></v-text-field>
              <small
                v-show="form.errors.has('password_confirmation')"
                class="validation-error"
              >{{
                form.errors.get('password_confirmation')
              }}</small>
            </v-col>
          </v-row>
          <v-btn
            color="primary"
            class="me-3 mt-3"
            type="submit"
            :loading="form.busy"
          >
            Save changes
          </v-btn>
        </v-form>
      </v-card-text>
    </div>

    <!-- divider -->
    <v-divider></v-divider>

    <div class="pa-3">
      <v-card-text>
        <v-row>
          <p class="text--primary body-1 mt-5">
            Auto logout after
          </p>
          <v-select
            :value="autoLogoutTime"
            :items="minutes"
            outlined
            dense
            class="shrink number-input ma-3"
            @change="updateLogoutTime"
          ></v-select>
          <p class="text--primary body-1 mt-5">
            minutes of inactivity
          </p>
        </v-row>
      </v-card-text>
    </div>
  </v-card>
</template>

<script>
import axios from 'axios'
import Form from 'vform'
import { mapGetters, mapActions } from 'vuex'
import {
  mdiKeyOutline, mdiLockOpenOutline, mdiEyeOffOutline, mdiEyeOutline,
} from '@mdi/js'
import { ref } from '@vue/composition-api'

export default {
  setup() {
    const isCurrentPasswordVisible = ref(false)
    const isNewPasswordVisible = ref(false)
    const isCPasswordVisible = ref(false)

    return {
      isCurrentPasswordVisible,
      isNewPasswordVisible,
      isCPasswordVisible,
      icons: {
        mdiKeyOutline,
        mdiLockOpenOutline,
        mdiEyeOffOutline,
        mdiEyeOutline,
      },
    }
  },
  data() {
    return {
      timer: null,
      autoLogoutEnabled: true,
      form: new Form({
        id: '',
        current_password: '',
        password: '',
        password_confirmation: '',
      }),
      minutes: [5, 10, 15, 30, 60],
    }
  },
  computed: {
    ...mapGetters(['autoLogoutTime', 'isAutoLogoutEnabled']),
  },
  watch: {
    autoLogoutEnabled() {
      this.toggleAutoLogout()
    },
  },
  mounted() {
    this.getUserInfo()
    this.autoLogoutEnabled = this.isAutoLogoutEnabled
  },
  methods: {
    ...mapActions(['toggleAutoLogout', 'setAutoLogoutTime']),
    updatePassword() {
      const isFormValid = this.$refs.form.validate()
      if (isFormValid) {
        this.form
          .put(`/users/update_password/${this.form.id}`)
          .then(() => {
            this.$refs.form.reset()
            this.$toast.success('Password updated successfully')
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      }
    },
    getUserInfo() {
      this.isLoading = true
      axios
        .get('user')
        .then(response => {
          this.form.id = response.data.id
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
          this.$toast.error(error.response.data.message)
        })
    },
    updateLogoutTime(time) {
      this.setAutoLogoutTime(time)
    },
  },
}
</script>

<style lang="scss" scoped>
.two-factor-auth {
  max-width: 25rem;
}
.security-character {
  position: absolute;
  bottom: -0.5rem;
}
.number-input {
  width: 80px;
}
</style>
