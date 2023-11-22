<template>
    <div class="sales">
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
            @click="showAddSaleDialog = true"
          >
            <v-icon
              left
              size="22"
            >
              {{ icons.mdiPlus }}
            </v-icon>
            Add Sale
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
                  :loading="isSalesRefreshing"
                  @click="refreshSales()"
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
            :items="sales"
            :loading="isSalesLoading"
            :server-items-length="pagination.totalItems"
            :options.sync="options"
            :footer-props="footerProps"
            show-select
            class="clickable-data-table"
            @click:row="saleDetails"
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
                    @click.stop="editSale(item)"
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
                    @click.stop="showDeleteSaleDialog(item.id)"
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
      <add-sale-dialog
        :show-dialog="showAddSaleDialog"
        :sale="sale"
        @close="
          showAddSaleDialog = false
          sale = {}
        "
        @sale-added="onSaleAdded"
        @sale-updated="onSaleUpdated"
      />
      <confirm-dialog
        :show-dialog="showConfirmDeleteDialog"
        :is-agree-button-loading="isConfirmDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmDeleteDialog = false"
        @agree="deleteSale()"
      />
      <confirm-dialog
        :show-dialog="showConfirmBulkDeleteDialog"
        :message="'Are you sure you want to delete ' + selected.length + ' records?'"
        :is-agree-button-loading="isConfirmBulkDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmBulkDeleteDialog = false"
        @agree="deleteSelectedSales()"
      />
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import _ from 'lodash'
  import {
    mdiMagnify, mdiPencil, mdiDelete, mdiPlus,
  } from '@mdi/js'
  import AddSaleDialog from '@/components/dialogs/AddSaleDialog.vue'
  import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
  import BreadCrumb from '@/components/partials/BreadCrumb.vue'
  import SearchInput from '@/components/partials/SearchInput.vue'
  import RefreshButton from '@/components/partials/RefreshButton.vue'
  
  export default {
    components: {
      AddSaleDialog,
      ConfirmDialog,
      breadcrumb: BreadCrumb,
      SearchInput,
      RefreshButton,
    },
    data() {
      return {
        showAddSaleDialog: false,
        showConfirmDeleteDialog: false,
        showConfirmBulkDeleteDialog: false,
        isConfirmDeleteDialogButtonLoading: false,
        isConfirmBulkDeleteDialogButtonLoading: false,
        isSalesRefreshing: false,
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
            text: 'Product Name',
            value: 'product.name',
          },
          {
            text: 'Quantity',
            value: 'quantity',
          },
          {
            text: 'Total Price',
            value: 'total_price',
          },
          {
            text: 'Sale Date',
            value: 'created_at',
          },
          { text: 'Actions', value: 'actions', sortable: false },
        ],
        searchColumn: 'title',
        searchFilters: [
          {
            text: 'Product Name',
            value: 'product.name',
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
        sale: {},
        sales: [],
        isSalesLoading: true,
        salesUrl: 'sales',
        breadcrumbs: [
          {
            text: 'Dashboard',
            disabled: false,
            to: { name: 'dashboard' },
          },
          {
            text: 'Sales',
            disabled: false,
            to: { name: 'sales' },
          },
        ],
      }
    },
    computed: {
      refreshTable() {
        return `${this.salesUrl}|${this.search}|${this.sortBy}|${this.sortDesc}`
      },
    },
    watch: {
      options: {
        handler() {
          this.getSales()
        },
        deep: true,
      },
      refreshTable() {
        this.getSales()
      },
      searchColumn() {
        if (this.search !== '') {
          this.getSales()
        }
      },
    },
    mounted() {
      this.getSales()
    },
    methods: {
      getSales: _.debounce(function () {
        this.isSalesLoading = true
        const {
          sortBy, sortDesc, page, itemsPerPage,
        } = this.options
        const sortOrder = sortDesc[0] ? 'desc' : 'asc'
        axios
          .get(
            `${this.salesUrl}?paginate=true&sortBy=${sortBy[0]}&sortDirection=${sortOrder}&search=${this.search}&searchColumn=${this.searchColumn}&page=${page}&perPage=${itemsPerPage}`,
          )
          .then(response => {
            this.sales = response.data.data
            this.pagination.page = response.data.current_page
            this.pagination.pageCount = response.data.last_page
            this.pagination.itemsPerPage = response.data.per_page
            this.pagination.totalItems = response.data.total
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.isSalesLoading = false
            this.isSalesRefreshing = false
          })
      }, 500),
      refreshSales() {
        this.isSalesRefreshing = true
        this.getSales()
      },
      editSale(sale) {
        this.sale = sale
        this.showAddSaleDialog = true
      },
      showDeleteSaleDialog(id) {
        this.showConfirmDeleteDialog = true
        this.toDelete = id
      },
      deleteSelectedSales() {
        this.isConfirmBulkDeleteDialogButtonLoading = true
        const selectedIds = this.selected.map(sale => sale.id)
        axios
          .delete('bulk-delete/sales', { data: { ids: selectedIds } })
          .then(() => {
            this.selected = []
            this.getSales()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmBulkDeleteDialog = false
            this.isConfirmBulkDeleteDialogButtonLoading = false
          })
      },
      deleteSale() {
        this.isConfirmDeleteDialogButtonLoading = true
        axios
          .delete(`sales/${this.toDelete}`)
          .then(() => {
            this.refreshSales()
            this.$toast.success('Sale deleted successfully')
          }).catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmDeleteDialog = false
            this.isConfirmDeleteDialogButtonLoading = false
          })
      },
      onSaleAdded() {
        this.refreshSales()
      },
      onSaleUpdated() {
        this.refreshSales()
      },
      onPageChange() {
        this.getSales()
      },
      onSearchFilterChange(filter) {
        this.searchColumn = filter
      },
      // saleDetails(sale) {
      //   this.$router.push({ name: 'sale-details', params: { id: sale.id } })
      // },
    },
  }
  </script>