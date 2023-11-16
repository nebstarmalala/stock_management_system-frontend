<template>
    <v-row justify="center">
      <v-dialog
        v-model="showDialog"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ action === 'Save' ? 'Add' : 'Update' }} Shop</span>
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
                      label="name"
                      placeholder="Enter Shop name"
                      :rules="[v => !!v || 'Name is required']"
                      :error="form.errors.has('name')"
                      :error-messages="form.errors.get('name')"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                        v-model="form.type"
                        :items="storeTypeOptions"
                        label="type"
                        placeholder="Select store type"
                        :rules="[v => !!v || 'Store type is required']"
                        required
                        outlined
                        ></v-select>
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
  import axios from 'axios'
  
  export default {
    props: {
      showDialog: {
        type: Boolean,
      },
      shop: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      form: new Form({
        name: '',
        type: '',
        id: '',
      }),
      storeTypeOptions: [
        { text: 'Store', value: 1 },
        { text: 'Shop', value: 2 }
      ],
      action: 'Save',
      categories: [],
    }),
    watch: {
      shop() {
        if (Object.keys(this.shop).length > 0) {
          this.form.update(this.shop)
          this.action = 'Update'
        } else {
          this.action = 'Save'
        }
      },
    },
    mounted() {
      this.fetchShops()
    },
    methods: {
      async fetchShops() {
        try {
          const response = await axios.get('shops?perPage=100')
          this.shops = response.data.data
        } catch (error) {
          this.$toast.error(error.response.data.message)
        }
      },
      closeDialog() {
        this.$emit('close')
        this.$refs.form.resetValidation()
        this.form.errors.clear()
        this.$refs.form.reset()
      },
      saveOrUpdate() {
        const isFormValid = this.$refs.form.validate()
        if (isFormValid) {
          if (this.action === 'Save') {
            this.saveShop()
          } else {
            this.updateShop()
          }
        }
      },
      saveShop() {
        this.form
          .post('shops')
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('shop-added', response.data.shop)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
      updateShop() {
        this.form
          .put(`shops/${this.form.id}`)
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('shop-updated', response.data.shop)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
    },
  }
  </script>