<template>
  <div class="auth-wrapper auth-v1">
    <div class="auth-inner">
      <v-card class="auth-card">
        <!-- logo -->
        <v-card-title class="d-flex align-center justify-center py-7">
          <h2 class="text-2xl font-weight-semibold">
            Register
          </h2>
        </v-card-title>

        <!-- title -->
        <v-card-text>
          <p class="mb-2">
            Create a new account
          </p>
        </v-card-text>

        <v-card-text>
          <v-form
            ref="form"
            method="post"
            action="/"
            lazy-validation
            @submit.prevent="register()"
          >
            <v-row>
              <v-col
                cols="12"
                class="pb-0"
              >
                <v-text-field
                  v-model="form.name"
                  outlined
                  label="Name"
                  placeholder="John Doe"
                  :rules="nameRules"
                  hide-details
                  autocomplete="name"
                  class="mb-3"
                ></v-text-field>
              </v-col>

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
                  hide-details
                  autocomplete="email"
                  class="mb-3"
                ></v-text-field>
                <small
                  v-show="form.errors.has('email')"
                  class="validation-error"
                >{{
                  form.errors.get('email')
                }}</small>
              </v-col>

              <v-col
                cols="12"
                class="pb-0"
              >
                <v-text-field
                  v-model="form.password"
                  outlined
                  :type="isPasswordVisible ? 'text' : 'password'"
                  label="Password"
                  placeholder="············"
                  :append-icon="isPasswordVisible ? icons.mdiEyeOffOutline : icons.mdiEyeOutline"
                  :rules="passwordRules"
                  autocomplete="new-password"
                  hide-details
                  @click:append="isPasswordVisible = !isPasswordVisible"
                ></v-text-field>
                <small
                  v-show="form.errors.has('password')"
                  class="validation-error"
                >{{
                  form.errors.get('password')
                }}</small>
              </v-col>

              <v-btn
                block
                color="primary"
                class="mt-6"
                type="submit"
                :loading="form.busy"
              >
                Sign Up
              </v-btn>
            </v-row>
          </v-form>
        </v-card-text>

        <!-- create new account  -->
        <v-card-text class="d-flex align-center justify-center flex-wrap mt-2">
          <span class="me-2">
            Already have an account?
          </span>
          <router-link :to="{ name:'login' }">
            Sign in instead
          </router-link>
        </v-card-text>
      </v-card>
    </div>

    <!-- background triangle shape  -->
    <img
      class="auth-mask-bg"
      height="190"
      :src="require(`@/assets/images/misc/mask-${$vuetify.theme.dark ? 'dark':'light'}.png`)"
    >

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
      name: '',
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
    register() {
      if (!this.$refs.form.validate()) {
        return
      }
      this.form
        .post('register')
        .then(response => {
          const { data: { token, user } } = response
          axios.defaults.headers.common.Authorization = `Bearer ${response.token}`
          const userInfo = { name: user.name, email: user.email, authenticationToken: token }
          this.authenticateUser(userInfo)
          this.$router.push({ name: 'dashboard' })
        })
        .catch(error => {
          console.log('🚀 ~ file: Register.vue:184 ~ register ~ error:', error)
          this.$toast.error(error.response.data.message)
        })
    },
  },
}
</script>

<style lang="scss">
@import '~@/plugins/vuetify/default-preset/preset/pages/auth.scss';
</style>
