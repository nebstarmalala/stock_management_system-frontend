<template>
    <v-row justify="center">
      <v-dialog v-model="showDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ action === 'Save' ? 'Add' : 'Update' }} Order</span>
          </v-card-title>
          <v-form ref="form" method="post" action="/" lazy-validation @submit.prevent="saveOrUpdate()">
            <v-card-text>
              <v-container>
                <v-row>
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
                    <v-select
                      v-model="form.product_id"
                      label="Product"
                      :items="products"
                      item-text="name"
                      item-value="id"
                      placeholder="Select a product"
                      :rules="[v => !!v || 'Product is required']"
                      :error="form.errors.has('product_id')"
                      :error-messages="form.errors.get('product_id')"
                      required
                      outlined
                      @input="fetchProducts"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.quantity"
                      label="Quantity"
                      placeholder="Enter quantity"
                      :rules="[v => !!v || 'Quantity is required']"
                      :error="form.errors.has('quantity')"
                      :error-messages="form.errors.get('quantity')"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="form.payment_method"
                      label="Payment Method"
                      placeholder="Select Payment Method"
                      :items="paymentMethodOptions"
                      :rules="[v => !!v || 'Payment Method is required']"
                      :error="form.errors.has('payment_method')"
                      :error-messages="form.errors.get('payment_method')"
                      required
                      outlined
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="form.payment_terms"
                      label="Payment Terms"
                      placeholder="Select Payment Terms"
                      :items="paymentTermsOptions"
                      :rules="[v => !!v || 'Payment Terms is required']"
                      :error="form.errors.has('payment_terms')"
                      :error-messages="form.errors.get('payment_terms')"
                      required
                      outlined
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.delivery_info"
                      label="Delivery Information"
                      placeholder="Enter Delivery Information"
                      :rules="[v => !!v || 'Delivery Information is required']"
                      :error="form.errors.has('delivery_info')"
                      :error-messages="form.errors.get('delivery_info')"
                      required
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDialog()">
                Close
              </v-btn>
              <v-btn color="blue darken-1" text type="submit" :loading="form.busy">
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
      order: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
      form: new Form({
        supplier_id: '',
        product_id: '',
        quantity: '',
        payment_method: '',
        order_status: '',
        delivery_info: '',
        id: '',
      }),
      paymentMethodOptions: [
        { text: 'MPESA', value: 1 },
        { text: 'CREDIT CARD', value: 2 },
        { text: 'BANK TRANSFER', value: 3 },
        { text: 'CASH', value: 4 },
        { text: 'PAYPAL', value: 5 },
        { text: 'OTHER', value: 6 },
      ],
      paymentTermsOptions: [
        { text: 'CASH ON DELIVERY', value: 1 },
        { text: 'UPON RECEIPT', value: 2 },
        { text: 'CASH IN ADVANCE', value: 3 },
        { text: 'OTHER', value: 4 },
      ],
      action: 'Save',
      suppliers: [],
      products: [], 
    }),
    watch: {
      order() {
        if (Object.keys(this.order).length > 0) {
          this.form.update(this.order)
          this.action = 'Update'
        } else {
          this.action = 'Save'
        }
      },
    },
    mounted() {
      this.fetchSuppliers()
      this.fetchProducts()
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
            this.saveOrder()
          } else {
            this.updateOrder()
          }
        }
      },
      saveOrder() {
        this.form
          .post('purchase_orders') // Assuming the endpoint for creating orders is 'orders'
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('order-added', response.data.order)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
      updateOrder() {
        this.form
          .put(`purchase_orders/${this.form.id}`) // Assuming the endpoint for updating orders is 'orders/:id'
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('order-updated', response.data.order)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
    },
  }
  </script>
  