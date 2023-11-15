<template>
    <v-row justify="center">
      <v-dialog
        v-model="showDialog"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ action === 'Save' ? 'Add' : 'Update' }} Product</span>
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
                      placeholder="Enter product name"
                      :rules="[v => !!v || 'Name is required']"
                      :error="form.errors.has('name')"
                      :error-messages="form.errors.get('name')"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.description"
                      label="description"
                      placeholder="Enter product description"
                      :rules="[v => !!v || 'description is required']"
                      :error="form.errors.has('description')"
                      :error-messages="form.errors.get('description')"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.price"
                      label="price"
                      placeholder="Enter publication year"
                      :rules="[v => !!v || 'price is required']"
                      :error="form.errors.has('price')"
                      :error-messages="form.errors.get('price')"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="form.supplier_id"
                      label="Supplier"
                      :items="suppliers"
                      item-text="name"
                      item-value="id"
                      placeholder="Select a supplier"
                      :rules="[v => !!v || 'Supplier is required']"
                      :error="form.errors.has('supplier_id')"
                      :error-messages="form.errors.get('supplier_id')"
                      required
                      outlined
                      @input="fetchSuppliers"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.upc_code"
                      label="Upc Code"
                      placeholder="Enter Upc Code"
                      :rules="[v => !!v || 'Upc Code is required']"
                      :error="form.errors.has('upc_code')"
                      :error-messages="form.errors.get('upc_code')"
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
      product: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      form: new Form({
        title: '',
        isbn: '',
        publication_year: '',
        category_id: '',
        total_copies: '',
        id: '',
      }),
      action: 'Save',
      categories: [],
    }),
    watch: {
      product() {
        if (Object.keys(this.product).length > 0) {
          this.form.update(this.product)
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
            this.saveProduct()
          } else {
            this.updateProduct()
          }
        }
      },
      saveProduct() {
        this.form
          .post('products')
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('product-added', response.data.product)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
      updateProduct() {
        this.form
          .put(`products/${this.form.id}`)
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('product-updated', response.data.product)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
    },
  }
  </script>
  