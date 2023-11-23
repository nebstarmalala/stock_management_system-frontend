<template>
    <v-row justify="center">
      <v-dialog v-model="showDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ action === 'Save' ? 'Add' : 'Update' }} Purchase</span>
          </v-card-title>
          <v-form ref="form" method="post" action="/" lazy-validation @submit.prevent="saveOrUpdate()">
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="form.purchase_order_id"
                      label="Purchase Order"
                      :items="purchaseOrders"
                      item-text="order_number"
                      item-value="id"
                      placeholder="Select a purchase order"
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
                      outlined
                      required
                    ></v-select>
                  </v-col>
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
                    <v-text-field v-model="form.quantity" label="Quantity" outlined required></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="form.unit_price" label="Unit Price" outlined required></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field v-model="form.discount" label="Discount" outlined required></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-menu
                        v-model="dueDateMenu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                    >
                        <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="form.expiry_date"
                            label="Expiry date"
                            placeholder="Select expiry date"
                            readonly
                            v-bind="attrs"
                            outlined
                            :error="form.errors.has('expiry_date')"
                            :error-messages="form.errors.get('expiry_date')"
                            v-on="on"
                        ></v-text-field>
                        </template>
                        <v-date-picker
                        v-model="form.expiry_date"
                        @input="dueDateMenu = false"
                        ></v-date-picker>
                    </v-menu>
                    </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDialog()">Close</v-btn>
              <v-btn color="blue darken-1" text type="submit" :loading="form.busy">{{ action }}</v-btn>
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
      purchase: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      form: new Form({
        purchase_order_id: '',
        shop_id: '',
        product_id: '',
        quantity: '',
        unit_price: '',
        discount: '',
        total_price: '',
        expiry_date: '',
      }),
      action: 'Save',
      purchaseOrders: [],
      shops: [],
      products: [],
    }),
    watch: {
      purchase() {
        if (Object.keys(this.purchase).length > 0) {
          this.form.update(this.purchase)
          this.action = 'Update'
        } else {
          this.action = 'Save'
        }
      },
    },
    mounted() {
      this.fetchPurchaseOrders()
      this.fetchShops()
      this.fetchProducts()
    },
    methods: {
      async fetchPurchaseOrders() {
        try {
          const response = await axios.get('purchase_orders?perPage=100')
          this.purchaseOrders = response.data.data
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
      async fetchProducts() {
        try {
          const response = await axios.get('products?perPage=100')
          this.products = response.data.data
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
            this.savePurchase()
          } else {
            this.updatePurchase()
          }
        }
      },
      savePurchase() {
        this.form
          .post('purchases')
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('purchase-added', response.data.purchase)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
      updatePurchase() {
        this.form
          .put(`purchases/${this.form.id}`)
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('purchase-updated', response.data.purchase)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
    },
  }
  </script>
  