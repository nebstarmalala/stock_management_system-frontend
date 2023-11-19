<template>
    <v-row justify="center">
      <v-dialog
        v-model="showDialog"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ action === 'Save' ? 'Add' : 'Update' }} Transfer</span>
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
                      :rules="[v => !!v || 'Product is required']"
                      :error="form.errors.has('product_id')"
                      :error-messages="form.errors.get('product_id')"
                      required
                      outlined
                      @input="fetchSuppliers"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="form.source_id"
                      label="Source"
                      :items="shops"
                      item-text="name"
                      item-value="id"
                      placeholder="Select a source"
                      :rules="[v => !!v || 'Source is required']"
                      :error="form.errors.has('source_id')"
                      :error-messages="form.errors.get('source_id')"
                      required
                      outlined
                      @input="fetchSuppliers"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="form.destination_id"
                      label="Supplier"
                      :items="shops"
                      item-text="name"
                      item-value="id"
                      placeholder="Select a destination"
                      :rules="[v => !!v || 'Destination is required']"
                      :error="form.errors.has('destination_id')"
                      :error-messages="form.errors.get('destination_id')"
                      required
                      outlined
                      @input="fetchSuppliers"
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.quantity"
                      label="quantity"
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
                        v-model="form.status"
                        label="Status"
                        :items="statusOptions"
                        item-text="text"
                        item-value="value"
                        placeholder="Select status"
                        :rules="[v => !!form.status || 'Status is required']"
                        :error="form.errors.has('status')"
                        :error-messages="form.errors.get('status')"
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
      transfer: {
        type: Object,
        default: null,
      },
    },
    data: () => ({
        statusOptions: [
            { text: 'Pending', value: 1 },
            { text: 'In Progress', value: 2 },
            { text: 'Completed', value: 3 },
        ],
      form: new Form({
        product_id: '',
        source_id: '',
        destination_id: '',
        quantity: '',
        id: '',
      }),
      action: 'Save',
    }),
    watch: {
      transfer() {
        if (Object.keys(this.transfer).length > 0) {
          this.form.update(this.transfer)
          this.action = 'Update'
        } else {
          this.action = 'Save'
        }
      },
    },
    mounted() {
      this.fetchShops()
      this.fetchProducts()
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
            this.saveTransfer()
          } else {
            this.updateTransfer()
          }
        }
      },
      saveTransfer() {
        this.form
          .post('stock_transfers')
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('transfer-added', response.data.transfer)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
      updateTransfer() {
        this.form
          .put(`stock_transfers/${this.form.id}`)
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('transfer-updated', response.data.transfer)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      },
    },
  }
  </script>