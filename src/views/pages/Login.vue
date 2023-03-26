<template>
  <div class="auth-wrapper auth-v1">
    <div class="auth-inner">
      <v-card class="auth-card">
        <v-card-title class="d-flex align-center justify-center">
          <h2 class="text-2xl font-weight-semibold">
            Login
          </h2>
        </v-card-title>

        <!-- title -->
        <v-card-text>
          <p class="mb-2">
            Please sign-in to your account
          </p>
        </v-card-text>

        <!-- login form -->
        <v-card-text>
          <v-form
            ref="form"
            method="post"
            action="/"
            lazy-validation
            @submit.prevent="login()"
          >
            <v-row>
              <v-col
                cols="12"
                class="pb-0"
              >
                <v-text-field
                  v-model="form.email"
                  outlined
                  label="Email"
                  placeholder="john@example.com"
                  :rules="emailRules"
                  autocomplete="email"
                  required
                ></v-text-field>
                <small
                  v-show="form.errors.has('email')"
                  class="validation-error"
                >{{ form.errors.get('email') }}</small>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.password"
                  outlined
                  :type="isPasswordVisible ? 'text' : 'password'"
                  label="Password"
                  placeholder="············"
                  :append-icon="isPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                  :rules="passwordRules"
                  autocomplete="current-password"
                  required
                  @click:append="isPasswordVisible = !isPasswordVisible"
                ></v-text-field>
                <small
                  v-show="form.errors.has('password')"
                  class="validation-error"
                >{{
                  form.errors.get('password')
                }}</small>
              </v-col>
            </v-row>

            <div class="d-flex align-center justify-space-between flex-wrap">
              <v-checkbox
                label="Remember Me"
                hide-details
                class="me-3 mt-1"
              >
              </v-checkbox>

              <router-link :to="{ name: 'forgot-password' }">
                Forgot Password?
              </router-link>
            </div>

            <v-btn
              block
              color="primary"
              class="mt-6"
              type="submit"
              :loading="form.busy"
            >
              Login
            </v-btn>
          </v-form>
        </v-card-text>

        <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
          <span class="me-2">
            Don't have an account?
          </span>
          <router-link :to="{ name:'register' }">
            Create one
          </router-link>
        </v-card-text>
      </v-card>
    </div>

    <!-- background triangle shape  -->
    <img
      alt="background-img"
      class="auth-mask-bg"
      height="173"
      :src="require(`@/assets/images/misc/mask-${$vuetify.theme.dark ? 'dark' : 'light'}.png`)"
    />

    <!-- tree -->
    <v-img
      class="auth-tree"
      width="247"
      height="185"
      src="@/assets/images/misc/tree.png"
    ></v-img>

    <!-- tree  -->
    <v-img
      class="auth-tree-3"
      width="377"
      height="289"
      src="@/assets/images/misc/tree-3.png"
    ></v-img>
  </div>
</template>

<script>
import { mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js'
import { ref } from '@vue/composition-api'
import axios from 'axios'
import Form from 'vform'
import { mapActions } from 'vuex'
import validationRules from '@/mixins/validationRules'

export default {
  mixins: [validationRules],
  data: () => ({
    passwordRules: [v => !!v || 'Password is required'],
    form: new Form({
      email: '',
      password: '',
    }),
  }),
  setup() {
    const isPasswordVisible = ref(false)

    return {
      isPasswordVisible,
      icons: {
        mdiEyeOutline,
        mdiEyeOffOutline,
      },
    }
  },
  methods: {
    ...mapActions(['authenticateUser']),
    login() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.form
        .post('login')
        .then(response => {
          const { data: { token, user } } = response
          axios.defaults.headers.common.Authorization = `Bearer ${token}`
          const userInfo = { name: user.name, email: user.email, authenticationToken: token }
          this.authenticateUser(userInfo)
          this.$router.push({ name: 'dashboard' })
        })
        .catch(error => {
          console.log('🚀 ~ file: Login.vue:174 ~ login ~ error:', error)
          this.$toast.error(error.response.data.message)
        })
    },
  },
}
</script>

<style lang="scss">
@import '~@/plugins/vuetify/default-preset/preset/pages/auth.scss';
</style>
