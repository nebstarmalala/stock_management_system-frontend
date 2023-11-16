<template>
    <div class="suppliers">
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
            @click="showAddSupplierDialog = true"
          >
            <v-icon
              left
              size="22"
            >
              {{ icons.mdiPlus }}
            </v-icon>
            Add Supplier
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
                  :loading="isSuppliersRefreshing"
                  @click="refreshSuppliers()"
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
            :items="suppliers"
            :loading="isSuppliersLoading"
            :server-items-length="pagination.totalItems"
            :options.sync="options"
            :footer-props="footerProps"
            show-select
            class="clickable-data-table"
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
                    @click.stop="editSupplier(item)"
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
                    @click.stop="showDeleteSupplierDialog(item.id)"
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
      <add-supplier-dialog
        :show-dialog="showAddSupplierDialog"
        :supplier="supplier"
        @close="
          showAddSupplierDialog = false
          supplier = {}
        "
        @supplier-added="onSupplierAdded"
        @supplier-updated="onSupplierUpdated"
      />
      <confirm-dialog
        :show-dialog="showConfirmDeleteDialog"
        :is-agree-button-loading="isConfirmDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmDeleteDialog = false"
        @agree="deleteSupplier()"
      />
      <confirm-dialog
        :show-dialog="showConfirmBulkDeleteDialog"
        :message="'Are you sure you want to delete ' + selected.length + ' records?'"
        :is-agree-button-loading="isConfirmBulkDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmBulkDeleteDialog = false"
        @agree="deleteSelectedSuppliers()"
      />
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import _ from 'lodash'
  import {
    mdiMagnify, mdiPencil, mdiDelete, mdiPlus,
  } from '@mdi/js'
  import AddSupplierDialog from '@/components/dialogs/AddSupplierDialog.vue'
  import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
  import BreadCrumb from '@/components/partials/BreadCrumb.vue'
  import SearchInput from '@/components/partials/SearchInput.vue'
  import RefreshButton from '@/components/partials/RefreshButton.vue'
  
  export default {
    components: {
      AddSupplierDialog,
      ConfirmDialog,
      breadcrumb: BreadCrumb,
      SearchInput,
      RefreshButton,
    },
    data() {
      return {
        showAddSupplierDialog: false,
        showConfirmDeleteDialog: false,
        showConfirmBulkDeleteDialog: false,
        isConfirmDeleteDialogButtonLoading: false,
        isConfirmBulkDeleteDialogButtonLoading: false,
        isSuppliersRefreshing: false,
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
            text: 'Phone',
            value: 'phone',
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
            text: 'Phone',
            value: 'phone',
          },
        ],
        icons: {
          mdiMagnify,
          mdiPencil,
          mdiDelete,
          mdiPlus,
        },
        supplier: {},
        suppliers: [],
        isSuppliersLoading: true,
        suppliersUrl: 'suppliers',
        breadcrumbs: [
          {
            text: 'Dashboard',
            disabled: false,
            to: { name: 'dashboard' },
          },
          {
            text: 'suppliers',
            disabled: false,
            to: { name: 'suppliers' },
          },
        ],
      }
    },
    computed: {
      refreshTable() {
        return `${this.suppliersUrl}|${this.search}|${this.sortBy}|${this.sortDesc}`
      },
    },
    watch: {
      options: {
        handler() {
          this.getSuppliers()
        },
        deep: true,
      },
      refreshTable() {
        this.getSuppliers()
      },
      searchColumn() {
        if (this.search !== '') {
          this.getSuppliers()
        }
      },
    },
    mounted() {
      this.getSuppliers()
    },
    methods: {
      getSuppliers: _.debounce(function () {
        this.isSuppliersLoading = true
        const {
          sortBy, sortDesc, page, itemsPerPage,
        } = this.options
        const sortOrder = sortDesc[0] ? 'desc' : 'asc'
        axios
          .get(
            `${this.suppliersUrl}?paginate=true&sortBy=${sortBy[0]}&sortDirection=${sortOrder}&search=${this.search}&searchColumn=${this.searchColumn}&page=${page}&perPage=${itemsPerPage}`,
          )
          .then(response => {
            this.suppliers = response.data.data
            this.pagination.page = response.data.current_page
            this.pagination.pageCount = response.data.last_page
            this.pagination.itemsPerPage = response.data.per_page
            this.pagination.totalItems = response.data.total
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.isSuppliersLoading = false
            this.isSuppliersRefreshing = false
          })
      }, 500),
      refreshSuppliers() {
        this.isSuppliersRefreshing = true
        this.getSuppliers()
      },
      editSupplier(supplier) {
        this.supplier = supplier
        this.showAddSupplierDialog = true
      },
      showDeleteSupplierDialog(id) {
        this.showConfirmDeleteDialog = true
        this.toDelete = id
      },
      deleteSelectedSuppliers() {
        this.isConfirmBulkDeleteDialogButtonLoading = true
        const selectedIds = this.selected.map(supplier => supplier.id)
        axios
          .delete('bulk-delete/suppliers', { data: { ids: selectedIds } })
          .then(() => {
            this.selected = []
            this.getSuppliers()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmBulkDeleteDialog = false
            this.isConfirmBulkDeleteDialogButtonLoading = false
          })
      },
      deleteSupplier() {
        this.isConfirmDeleteDialogButtonLoading = true
        axios
          .delete(`suppliers/${this.toDelete}`)
          .then(() => {
            this.refreshSuppliers()
            this.$toast.success('Supplier deleted successfully')
          }).catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmDeleteDialog = false
            this.isConfirmDeleteDialogButtonLoading = false
          })
      },
      onSupplierAdded() {
        this.refreshSuppliers()
      },
      onSupplierUpdated() {
        this.refreshSuppliers()
      },
      onPageChange() {
        this.getSuppliers()
      },
      onSearchFilterChange(filter) {
        this.searchColumn = filter
      },
    },
  }
  </script>