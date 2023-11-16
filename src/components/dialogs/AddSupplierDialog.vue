<template>
    <v-row justify="center">
      <v-dialog
        v-model="showDialog"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ action === 'Save' ? 'Add' : 'Update' }} Supplier</span>
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
                      placeholder="Enter Supplier name"
                      :rules="[v => !!v || 'Name is required']"
                      :error="form.errors.has('name')"
                      :error-messages="form.errors.get('name')"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.phone"
                      label="phone"
                      placeholder="Enter phone number"
                      :rules="[v => !!v || 'phone is required']"
                      :error="form.errors.has('phone')"
                      :error-messages="form.errors.get('phone')"
                      required
                      outlined
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
  import axios from 'axios'
  
  export default {
    props: {
      showDialog: {
        type: Boolean,
      },
      supplier: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      form: new Form({
        name: '',
        phone: '',
        id: '',
      }),
      action: 'Save',
      categories: [],
    }),
    watch: {
      supplier() {
        if (Object.keys(this.supplier).length > 0) {
          this.form.update(this.supplier)
          this.action = 'Update'
        } else {
          this.action = 'Save'
        }
      },
    },
    mounted() {
      this.fetchSuppliers()
    },
    methods: {
      async fetchSuppliers() {
        try {
          const response = await axios.get('suppliers?perPage=100')
          this.suppliers = response.data.data
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
            this.saveSupplier()
          } else {
            this.updateSupplier()
          }
        }
      },
      saveSupplier() {
        this.form
          .post('suppliers')
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('supplier-added', response.data.supplier)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
      updateSupplier() {
        this.form
          .put(`suppliers/${this.form.id}`)
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('supplier-updated', response.data.supplier)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
    },
  }
  </script>