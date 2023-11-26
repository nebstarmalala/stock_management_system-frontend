<template>
  <v-card
    flat
    class="pa-3 mt-2"
  >
    <h1 class="text-center">
      Account settings
    </h1>
    <v-card-text>
      <h2 class="font-weight-medium">
        User information
      </h2>
      <v-form
        ref="form"
        class="multi-col-validation mt-6"
        method="post"
        action="/"
        lazy-validation
        @submit.prevent="save()"
      >
        <v-row>
          <v-col
            md="6"
            cols="12"
          >
            <v-text-field
              v-model="form.name"
              label="Name"
              :loading="isLoading"
              :disabled="isLoading"
              :rules="[v => !!v || 'Name is required']"
              dense
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            md="6"
            cols="12"
          >
            <v-text-field
              v-model="form.phone_number"
              label="Phone Number"
              :loading="isLoading"
              :disabled="isLoading"
              :rules="[v => !!v || 'Phone number is required']"
              dense
              outlined
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="form.email"
              label="E-mail"
              :loading="isLoading"
              :disabled="isLoading"
              :rules="[v => !!v || 'Email is required']"
              dense
              outlined
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-btn
              color="primary"
              class="me-3 mt-4"
              :loading="form.busy"
              type="submit"
            >
              Save changes
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from 'axios'
import Form from 'vform'
import validationRules from '@/mixins/validationRules'

export default {
  mixins: [validationRules],
  data() {
    return {
      isLoading: true,
      form: new Form({
        id: '',
        name: '',
        email: '',
        phone_number: '',
      }),
    }
  },
  mounted() {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      this.isLoading = true
      axios
        .get('user')
        .then(response => {
          this.form.id = response.data.id
          this.form.name = response.data.name
          this.form.email = response.data.email
          this.form.phone_number = response.data.phone_number
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
          this.$toast.error(error.response.data.message)
        })
    },
    save() {
      const isFormValid = this.$refs.form.validate()
      if (isFormValid) {
        this.form
          .put(`users/${this.form.id}`)
          .then(() => {
            this.$toast.success('Settings updated successfully')
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      }
    },
  },
}
</script>
