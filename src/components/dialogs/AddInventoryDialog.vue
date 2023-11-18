<template>
  <v-row justify="center">
    <v-dialog
      v-model="showDialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Add Inventory</span>
        </v-card-title>
        <v-form
          ref="form"
          method="post"
          action="/"
          lazy-validation
          @submit.prevent="saveInventory()"
        >
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-autocomplete
                    v-model="form.product_id"
                    label="Product"
                    placeholder="Search Product by name or upc code"
                    :items="products"
                    item-text="name"
                    item-value="id"
                    :rules="[v => !!v || 'Product is required']"
                    :error="form.errors.has('product_id')"
                    :error-messages="form.errors.get('product_id')"
                    :filter="productFilterObject"
                    required
                    outlined
                    hide-no-data
                    :search-input.sync="searchProducts"
                    @update:search-input="fetchProducts"
                  >
                    <template v-slot:selection="data">
                      {{ data.item.name }} - {{ data.item.upc_code }}
                    </template>
                    <template v-slot:item="data">
                      {{ data.item.name }} - {{ data.item.upc_code }}
                    </template>
                  </v-autocomplete>
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
              Save
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
import { debounce } from 'lodash'

export default {
  props: {
    showDialog: {
      type: Boolean,
    },
    shopId: {
      type: String,
      default: null
    }
  },
  mounted() {
    this.form.shop_id = this.shopId
  },
  data: () => ({
    form: new Form({
      shop_id: '',
      product_id: '',
      quantity: '',
      expiry_date: '',
    }),
    products: [],
    searchProducts: '',
    booksLoading: false,
  }),
  methods: {
    fetchProducts: debounce(function (search) {
      console.log('🚀 ~ file: AddInventoryDialog.vue:258 ~ search:', search)
      if (!search) {
        return
      }
      axios
        .get('/products', {
          params: {
            search,
            searchColumn: "['name', 'upc_code']",
          },
        })
        .then(response => {
          this.products = response.data.data
        })
        .catch(error => {
          console.error(error)
          this.$toast.error(error.response.data.message)
        })
    }, 300),
    closeDialog() {
      this.$emit('close')
      this.$refs.form.resetValidation()
      this.form.errors.clear()
      this.$refs.form.reset()
    },
    saveInventory() {
      const isFormValid = this.$refs.form.validate()
      if (isFormValid) {
        this.form
          .post('inventory')
          .then(response => {
            this.$toast.success(response.data.message)
            this.$emit('close')
            this.$emit('loan-added', response.data.loan)
            this.$refs.form.reset()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          })
      }
    },
  },
}
</script>
