<template>
    <v-row justify="center">
      <v-dialog
        v-model="showDialog"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ action === 'Save' ? 'Add' : 'Update' }} System User</span>
          </v-card-title>
          <v-form
            ref="form"
            method="post"
            action="/"
            lazy-validation
            @submit.prevent="saveOrUpdate()"
          >
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.name"
                      label="Full Name"
                      placeholder="John Doe"
                      :rules="nameRules"
                      :error="form.errors.has('name')"
                      :error-messages="form.errors.get('name')"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.email"
                      label="Email"
                      placeholder="example@domain.com"
                      :error="form.errors.has('email')"
                      :error-messages="form.errors.get('email')"
                      :rules="emailRules"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.phone_number"
                      label="Phone Number"
                      placeholder="07********"
                      :error="form.errors.has('phone_number')"
                      :error-messages="form.errors.get('phone_number')"
                      outlined
                    ></v-text-field>
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
                      :error="form.errors.has('password')"
                      :error-messages="form.errors.get('password')"
                      required
                      @click:append="isPasswordVisible = !isPasswordVisible"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="closeDialog()"
              >
                Close
              </v-btn>
              <v-btn
                color="blue darken-1"
                text
                type="submit"
                :loading="form.busy"
              >
                {{ action }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-row>
  </template>
  
  <script>
  import Form from 'vform'
  import { mapGetters } from 'vuex'
  import { mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js'
  import validationRules from '@/mixins/validationRules'
  
  export default {
    mixins: [validationRules],
    props: {
      showDialog: {
        type: Boolean,
      },
      user: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      form: new Form({
        name: '',
        email: '',
        phone_number: '',
        password: '',
      }),
      isPasswordVisible: false,
      passwordRules: [v => !!v || 'Password is required'],
      icons: {
        mdiEyeOutline,
        mdiEyeOffOutline,
      },
      action: 'Save',
    }),
    computed: {
      ...mapGetters(['selectedStation']),
    },
    watch: {
      user() {
        if (Object.keys(this.user).length > 0) {
          this.form.update(this.user)
          this.action = 'Update'
        } else {
          this.action = 'Save'
        }
      },
    },
    methods: {
      closeDialog() {
        this.$emit('close')
        this.$refs.form.reset()
      },
      saveOrUpdate() {
        const isFormValid = this.$refs.form.validate()
        if (isFormValid) {
          if (this.action === 'Save') {
            this.saveUser()
          } else {
            this.updateUser()
          }
        }
      },
      saveUser() {
        this.form
          .post('users')
          .then(() => {
            this.$toast.success('System User added successfully')
            this.$emit('close')
            this.$emit('user-added')
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
    },
  }
  </script>
  