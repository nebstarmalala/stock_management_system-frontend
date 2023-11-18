<template>
    <div class="customers">
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
            @click="showAddCustomerDialog = true"
          >
            <v-icon
              left
              size="22"
            >
              {{ icons.mdiPlus }}
            </v-icon>
            Add Customer
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
                  :loading="isCustomersRefreshing"
                  @click="refreshCustomers()"
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
            :items="customers"
            :loading="isCustomersLoading"
            :server-items-length="pagination.totalItems"
            :options.sync="options"
            :footer-props="footerProps"
            show-select
            class="clickable-data-table"
            @click:row="customerDetails"
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
                    @click.stop="editCustomer(item)"
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
                    @click.stop="showDeleteCustomerDialog(item.id)"
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
      <add-customer-dialog
        :show-dialog="showAddCustomerDialog"
        :customer="customer"
        @close="
          showAddCustomerDialog = false
          Customer = {}
        "
        @customer-added="onCustomerAdded"
        @customer-updated="onCustomerUpdated"
      />
      <confirm-dialog
        :show-dialog="showConfirmDeleteDialog"
        :is-agree-button-loading="isConfirmDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmDeleteDialog = false"
        @agree="deleteCustomer()"
      />
      <confirm-dialog
        :show-dialog="showConfirmBulkDeleteDialog"
        :message="'Are you sure you want to delete ' + selected.length + ' records?'"
        :is-agree-button-loading="isConfirmBulkDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmBulkDeleteDialog = false"
        @agree="deleteSelectedCustomers()"
      />
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import _ from 'lodash'
  import {
    mdiMagnify, mdiPencil, mdiDelete, mdiPlus,
  } from '@mdi/js'
  import AddCustomerDialog from '@/components/dialogs/AddCustomerDialog.vue'
  import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
  import BreadCrumb from '@/components/partials/BreadCrumb.vue'
  import SearchInput from '@/components/partials/SearchInput.vue'
  import RefreshButton from '@/components/partials/RefreshButton.vue'
  
  export default {
    components: {
      AddCustomerDialog,
      ConfirmDialog,
      breadcrumb: BreadCrumb,
      SearchInput,
      RefreshButton,
    },
    data() {
      return {
        showAddCustomerDialog: false,
        showConfirmDeleteDialog: false,
        showConfirmBulkDeleteDialog: false,
        isConfirmDeleteDialogButtonLoading: false,
        isConfirmBulkDeleteDialogButtonLoading: false,
        isCustomersRefreshing: false,
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
            text: 'Phone Number',
            value: 'phone_number',
          },
          {
            text: 'Loyalty Points',
            value: 'loyalty_points',
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
        customer: {},
        customers: [],
        isCustomersLoading: true,
        customersUrl: 'customers',
        breadcrumbs: [
          {
            text: 'Dashboard',
            disabled: false,
            to: { name: 'dashboard' },
          },
          {
            text: 'Customers',
            disabled: false,
            to: { name: 'customers' },
          },
        ],
      }
    },
    computed: {
      refreshTable() {
        return `${this.customersUrl}|${this.search}|${this.sortBy}|${this.sortDesc}`
      },
    },
    watch: {
      options: {
        handler() {
          this.getCustomers()
        },
        deep: true,
      },
      refreshTable() {
        this.getCustomers()
      },
      searchColumn() {
        if (this.search !== '') {
          this.getCustomers()
        }
      },
    },
    mounted() {
      this.getCustomers()
    },
    methods: {
      getCustomers: _.debounce(function () {
        this.isCustomersLoading = true
        const {
          sortBy, sortDesc, page, itemsPerPage,
        } = this.options
        const sortOrder = sortDesc[0] ? 'desc' : 'asc'
        axios
          .get(
            `${this.customersUrl}?paginate=true&sortBy=${sortBy[0]}&sortDirection=${sortOrder}&search=${this.search}&searchColumn=${this.searchColumn}&page=${page}&perPage=${itemsPerPage}`,
          )
          .then(response => {
            this.customers = response.data.data
            this.pagination.page = response.data.current_page
            this.pagination.pageCount = response.data.last_page
            this.pagination.itemsPerPage = response.data.per_page
            this.pagination.totalItems = response.data.total
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.isCustomersLoading = false
            this.isCustomersRefreshing = false
          })
      }, 500),
      refreshCustomers() {
        this.isCustomersRefreshing = true
        this.getCustomers()
      },
      editCustomer(customer) {
        this.customer = customer
        this.showAddCustomerDialog = true
      },
      showDeleteCustomerDialog(id) {
        this.showConfirmDeleteDialog = true
        this.toDelete = id
      },
      deleteSelectedCustomers() {
        this.isConfirmBulkDeleteDialogButtonLoading = true
        const selectedIds = this.selected.map(customer => customer.id)
        axios
          .delete('bulk-delete/customers', { data: { ids: selectedIds } })
          .then(() => {
            this.selected = []
            this.getCustomers()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmBulkDeleteDialog = false
            this.isConfirmBulkDeleteDialogButtonLoading = false
          })
      },
      deleteCustomer() {
        this.isConfirmDeleteDialogButtonLoading = true
        axios
          .delete(`customers/${this.toDelete}`)
          .then(() => {
            this.refreshCustomers()
            this.$toast.success('Customer deleted successfully')
          }).catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmDeleteDialog = false
            this.isConfirmDeleteDialogButtonLoading = false
          })
      },
      onCustomerAdded() {
        this.refreshCustomers()
      },
      onCustomerUpdated() {
        this.refreshCustomers()
      },
      onPageChange() {
        this.getCustomers()
      },
      onSearchFilterChange(filter) {
        this.searchColumn = filter
      },
      // CustomerDetails(Customer) {
      //   this.$router.push({ name: 'customer-details', params: { id: customer.id } })
      // },
    },
  }
  </script>