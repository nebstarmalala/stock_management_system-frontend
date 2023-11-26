<template>
  <v-card flat class="mt-5">
    <div class="px-3">
      <h1 class="text-center">System Settings</h1>
      <v-form ref="form" lazy-validation @submit.prevent="saveSettings">
        <v-card-text>
          <v-row class="ml-4 mt-1">
            <p class="text--primary body-1 mt-5">
              Maximum number of books a student can borrow:
            </p>
            <v-text-field
              v-model="max_books_per_student"
              label="Max Books"
              placeholder="5"
              dense
              outlined
              :rules="numberRules"
              :loading="isSettingsLoading"
              :disabled="isSettingsLoading"
              class="shrink ma-3"
            ></v-text-field>
          </v-row>

          <v-row class="ml-4 mt-1">
            <p class="text--primary body-1 mt-5">Fine Amount:</p>
            <v-text-field
              v-model="fine_amount"
              label="Fine Amount"
              placeholder="10"
              dense
              outlined
              :rules="numberRules"
              :loading="isSettingsLoading"
              :disabled="isSettingsLoading"
              class="shrink ma-3"
            ></v-text-field>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text>
          <v-btn
            color="primary"
            class="me-3 mt-3"
            :loading="isSaving"
            @click="saveSettings"
          >
            Save changes
          </v-btn>
        </v-card-text>
      </v-form>
    </div>
  </v-card>
</template>

<script>
import axios from 'axios'
import validationRules from '@/mixins/validationRules'

export default {
  mixins: [validationRules],
  data() {
    return {
      isSettingsLoading: true,
      isSaving: false,
      settings: [],
      max_books_per_student: '',
      fine_amount: '',
    }
  },
  mounted() {
    this.fetchSettings()
  },
  methods: {
    fetchSettings() {
      this.isSettingsLoading = true
      axios.get('settings')
        .then(response => {
          this.settings = response.data
          this.settings.forEach(setting => {
            if (setting.name in this) {
              this[setting.name] = setting.value
            }
          })
        })
        .catch(error => {
          console.log(error)
          this.$toast.error(error.response.data.message)
        }).finally(() => {
          this.isSettingsLoading = false
        })
    },
    saveSettings() {
      if (this.$refs.form.validate()) {
        this.isSaving = true
        this.settings.forEach(setting => {
          if (setting.name in this) {
            axios.put(`settings/${setting.id}`, { value: this[setting.name] })
              .then(() => {
                this.$toast.success('Settings updated successfully')
              })
              .catch(error => {
                this.$toast.error(error.response.data.message)
              }).finally(() => {
                this.isSaving = false
              })
          }
        })
      }
    },
  },
}
</script>
