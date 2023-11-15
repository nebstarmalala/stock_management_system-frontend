<template>
    <div class="products">
      <v-row>
        <v-col
          sm="12"
          md="6"
        >
          <breadcrumb :items="breadcrumbs" />
        </v-col>
        <v-col
          sm="12"
          md="6"
          class="text-md-right"
        >
          <v-btn
            color="primary"
            class="mb-5"
            @click="showAddProductDialog = true"
          >
            <v-icon
              left
              size="22"
            >
              {{ icons.mdiPlus }}
            </v-icon>
            Add Product
          </v-btn>
        </v-col>
      </v-row>
      <v-expand-transition>
        <v-card>
          <v-card-title>
            <v-row
              justify="center"
              class="mb-0"
            >
              <v-col
                md="4"
                sm="12"
              >
                <refresh-button
                  :loading="isProductsRefreshing"
                  @click="refreshProducts()"
                />
              </v-col>
              <v-col
                md="6"
                sm="12"
                class="text-center"
              >
                <search-input
                  v-model="search"
                  :filters="searchFilters"
                  :active-filter="searchColumn"
                  @filter-change="onSearchFilterChange"
                />
              </v-col>
              <v-spacer class="d-none d-md-inline" />
            </v-row>
          </v-card-title>
          <v-expand-transition>
            <v-row
              v-if="selected.length > 0"
              class="mb-2"
            >
              <v-col class="text-md-right">
                <v-btn
                  color="error"
                  class="ma-2"
                  @click="showConfirmBulkDeleteDialog = true"
                >
                  <v-icon
                    left
                    size="22"
                  >
                    {{ icons.mdiDelete }}
                  </v-icon>
                  Delete Selected
                </v-btn>
              </v-col>
            </v-row>
          </v-expand-transition>
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="products"
            :loading="isProductsLoading"
            :server-items-length="pagination.totalItems"
            :options.sync="options"
            :footer-props="footerProps"
            show-select
            class="clickable-data-table"
            @click:row="productDetails"
          >
            <template v-slot:item.category="{ item }">
              {{ item.category.name }}
            </template>
            <template
              v-slot:item.actions="{ item }"
            >
              <v-tooltip
                bottom
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    ma-4
                    v-bind="attrs"
                    text
                    icon
                    @click.stop="editProduct(item)"
                    v-on="on"
                  >
                    <v-icon
                      v-bind="attrs"
                      v-on="on"
                    >
                      {{ icons.mdiPencil }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>
              <v-tooltip
                bottom
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    ma-4
                    v-bind="attrs"
                    text
                    icon
                    @click.stop="showDeleteProductDialog(item.id)"
                    v-on="on"
                  >
                    <v-icon
                      v-bind="attrs"
                      v-on="on"
                    >
                      {{ icons.mdiDelete }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-expand-transition>
      <add-product-dialog
        :show-dialog="showAddProductDialog"
        :product="product"
        @close="
          showAddProductDialog = false
          product = {}
        "
        @product-added="onProductAdded"
        @product-updated="onProductUpdated"
      />
      <confirm-dialog
        :show-dialog="showConfirmDeleteDialog"
        :is-agree-button-loading="isConfirmDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmDeleteDialog = false"
        @agree="deleteProduct()"
      />
      <confirm-dialog
        :show-dialog="showConfirmBulkDeleteDialog"
        :message="'Are you sure you want to delete ' + selected.length + ' records?'"
        :is-agree-button-loading="isConfirmBulkDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmBulkDeleteDialog = false"
        @agree="deleteSelectedProducts()"
      />
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import _ from 'lodash'
  import {
    mdiMagnify, mdiPencil, mdiDelete, mdiPlus,
  } from '@mdi/js'
  import AddProductDialog from '@/components/dialogs/AddProductDialog.vue'
  import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
  import BreadCrumb from '@/components/partials/BreadCrumb.vue'
  import SearchInput from '@/components/partials/SearchInput.vue'
  import RefreshButton from '@/components/partials/RefreshButton.vue'
  
  export default {
    components: {
      AddProductDialog,
      ConfirmDialog,
      breadcrumb: BreadCrumb,
      SearchInput,
      RefreshButton,
    },
    data() {
      return {
        showAddProductDialog: false,
        showConfirmDeleteDialog: false,
        showConfirmBulkDeleteDialog: false,
        isConfirmDeleteDialogButtonLoading: false,
        isConfirmBulkDeleteDialogButtonLoading: false,
        isProductsRefreshing: false,
        toDelete: null,
        sortBy: ['name'],
        sortDesc: [true],
        search: '',
        pagination: {
          page: 1,
          pageCount: 1,
          itemsPerPage: 10,
          totalItems: 0,
        },
        footerProps: {
          itemsPerPageOptions: [5, 10, 25, 50, 100],
        },
        selected: [],
        options: {},
        headers: [
          {
            text: 'Name',
            value: 'name',
          },
          {
            text: 'Description',
            value: 'description',
          },
          {
            text: 'Price',
            value: 'price',
          },
          {
            text: 'UPC Code',
            value: 'upc_code',
          },
          { text: 'Actions', value: 'actions', sortable: false },
        ],
        searchColumn: 'title',
        searchFilters: [
          {
            text: 'Name',
            value: 'name',
          },
          {
            text: 'UPC Code',
            value: 'upc_code',
          },
          {
            text: 'Price',
            value: 'price',
          },
        ],
        icons: {
          mdiMagnify,
          mdiPencil,
          mdiDelete,
          mdiPlus,
        },
        product: {},
        products: [],
        isProductsLoading: true,
        productsUrl: 'products',
        breadcrumbs: [
          {
            text: 'Dashboard',
            disabled: false,
            to: { name: 'dashboard' },
          },
          {
            text: 'Products',
            disabled: false,
            to: { name: 'products' },
          },
        ],
      }
    },
    computed: {
      refreshTable() {
        return `${this.productsUrl}|${this.search}|${this.sortBy}|${this.sortDesc}`
      },
    },
    watch: {
      options: {
        handler() {
          this.getProducts()
        },
        deep: true,
      },
      refreshTable() {
        this.getProducts()
      },
      searchColumn() {
        if (this.search !== '') {
          this.getProducts()
        }
      },
    },
    mounted() {
      this.getProducts()
    },
    methods: {
      getProducts: _.debounce(function () {
        this.isProductsLoading = true
        const {
          sortBy, sortDesc, page, itemsPerPage,
        } = this.options
        const sortOrder = sortDesc[0] ? 'desc' : 'asc'
        axios
          .get(
            `${this.productsUrl}?paginate=true&sortBy=${sortBy[0]}&sortDirection=${sortOrder}&search=${this.search}&searchColumn=${this.searchColumn}&page=${page}&perPage=${itemsPerPage}`,
          )
          .then(response => {
            this.products = response.data.data
            this.pagination.page = response.data.current_page
            this.pagination.pageCount = response.data.last_page
            this.pagination.itemsPerPage = response.data.per_page
            this.pagination.totalItems = response.data.total
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.isProductsLoading = false
            this.isProductsRefreshing = false
          })
      }, 500),
      refreshProducts() {
        this.isProductsRefreshing = true
        this.getProducts()
      },
      editProduct(product) {
        this.product = product
        this.showAddProductDialog = true
      },
      showDeleteProductDialog(id) {
        this.showConfirmDeleteDialog = true
        this.toDelete = id
      },
      deleteSelectedProducts() {
        this.isConfirmBulkDeleteDialogButtonLoading = true
        const selectedIds = this.selected.map(product => product.id)
        axios
          .delete('bulk-delete/products', { data: { ids: selectedIds } })
          .then(() => {
            this.selected = []
            this.getProducts()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmBulkDeleteDialog = false
            this.isConfirmBulkDeleteDialogButtonLoading = false
          })
      },
      deleteProduct() {
        this.isConfirmDeleteDialogButtonLoading = true
        axios
          .delete(`products/${this.toDelete}`)
          .then(() => {
            this.refreshProducts()
            this.$toast.success('Product deleted successfully')
          }).catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmDeleteDialog = false
            this.isConfirmDeleteDialogButtonLoading = false
          })
      },
      onProductAdded() {
        this.refreshProducts()
      },
      onProductUpdated() {
        this.refreshProducts()
      },
      onPageChange() {
        this.getProducts()
      },
      onSearchFilterChange(filter) {
        this.searchColumn = filter
      },
      // productDetails(product) {
      //   this.$router.push({ name: 'product-details', params: { id: product.id } })
      // },
    },
  }
  </script>
  