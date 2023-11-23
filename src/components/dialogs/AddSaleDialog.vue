<template>
    <v-row justify="center">
      <v-dialog
        v-model="showDialog"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ action === 'Save' ? 'Add' : 'Update' }} Sale</span>
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
                    <v-select
                      v-model="form.product_id"
                      label="Product"
                      :items="products"
                      item-text="name"
                      item-value="id"
                      placeholder="Select a product"
                      outlined
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="form.shop_id"
                      label="Shop"
                      :items="shops"
                      item-text="name"
                      item-value="id"
                      placeholder="Select a shop"
                      :rules="[v => !!v || 'Shop is required']"
                      :error="form.errors.has('shop_id')"
                      :error-messages="form.errors.get('shop_id')"
                      required
                      outlined
                      @input="fetchSuppliers"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="form.customer_id"
                      label="Customer"
                      :items="customers"
                      item-text="name"
                      item-value="id"
                      placeholder="Select a Customer"
                      :error="form.errors.has('shop_id')"
                      :error-messages="form.errors.get('shop_id')"
                      required
                      outlined
                      @input="fetchSuppliers"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="form.quantity" label="Quantity" outlined required></v-text-field>
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
      sale: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      form: new Form({
        shop_id: '',
        product_id: '',
        quantity: '',
        id: '',
      }),
      action: 'Save',
      categories: [],
    }),
    watch: {
      sale() {
        if (Object.keys(this.sale).length > 0) {
          this.form.update(this.sale)
          this.action = 'Update'
        } else {
          this.action = 'Save'
        }
      },
    },
    mounted() {
      this.fetchProducts()
      this.fetchShops()
      this.fetchCustomers()
    },
    methods: {
       async fetchProducts() {
        try {
          const response = await axios.get('products?perPage=100')
          this.products = response.data.data
        } catch (error) {
          this.$toast.error(error.response.data.message)
        }
      },
      async fetchShops() {
        try {
          const response = await axios.get('shops?perPage=100')
          this.shops = response.data.data
        } catch (error) {
          this.$toast.error(error.response.data.message)
        }
      },
      async fetchCustomers() {
        try {
          const response = await axios.get('customers?perPage=100')
          this.customers = response.data.data
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
            this.saveSale()
          } else {
            this.updateSale()
          }
        }
      },
      saveSale() {
        this.form
          .post('sales')
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('sale-added', response.data.sale)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
      updateSale() {
        this.form
          .put(`sales/${this.form.id}`)
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('sale-updated', response.data.sale)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
    },
  }
  </script>