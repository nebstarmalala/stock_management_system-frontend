<template>
    <div class="inventories">
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
            @click="showAddInventoryDialog = true"
          >
            <v-icon
              left
              size="22"
            >
              {{ icons.mdiPlus }}
            </v-icon>
            Add Inventory
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
                  :loading="isInventoriesRefreshing"
                  @click="refreshInventories()"
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
            :items="inventories"
            :loading="isInventoriesLoading"
            :server-items-length="pagination.totalItems"
            :options.sync="options"
            :footer-props="footerProps"
            show-select
            class="clickable-data-table"
            @click:row="inventory"
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
                    @click.stop="editInventory(item)"
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
                    @click.stop="showDeleteInventoryDialog(item.id)"
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
      <add-inventory-dialog
        :show-dialog="showAddInventoryDialog"
        :inventory="inventory"
        :shop-id="shopId"
        @close="
          showAddInventoryDialog = false
          inventory = {}
        "
        @inventory-added="onInventoryAdded"
        @inventory-updated="onInventoryUpdated"
      />
      <confirm-dialog
        :show-dialog="showConfirmDeleteDialog"
        :is-agree-button-loading="isConfirmDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmDeleteDialog = false"
        @agree="deleteInventory()"
      />
      <confirm-dialog
        :show-dialog="showConfirmBulkDeleteDialog"
        :message="'Are you sure you want to delete ' + selected.length + ' records?'"
        :is-agree-button-loading="isConfirmBulkDeleteDialogButtonLoading"
        :agree-text="'Delete'"
        @cancel="showConfirmBulkDeleteDialog = false"
        @agree="deleteSelectedInventories()"
      />
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import _ from 'lodash'
  import {
    mdiMagnify, mdiPencil, mdiDelete, mdiPlus,
  } from '@mdi/js'
  import AddInventoryDialog from '@/components/dialogs/AddInventoryDialog.vue'
  import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
  import BreadCrumb from '@/components/partials/BreadCrumb.vue'
  import SearchInput from '@/components/partials/SearchInput.vue'
  import RefreshButton from '@/components/partials/RefreshButton.vue'
  
  export default {
    components: {
      AddInventoryDialog,
      ConfirmDialog,
      breadcrumb: BreadCrumb,
      SearchInput,
      RefreshButton,
    },
    data() {
      return {
        showAddInventoryDialog: false,
        showConfirmDeleteDialog: false,
        showConfirmBulkDeleteDialog: false,
        isConfirmDeleteDialogButtonLoading: false,
        isConfirmBulkDeleteDialogButtonLoading: false,
        isInventoriesRefreshing: false,
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
            text: 'Product Description',
            value: 'product.description',
          },
          {
            text: 'Quantity',
            value: 'quantity',
          },
          {
            text: 'Expiry Date',
            value: 'expiry_date',
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
            text: 'Shop Type',
            value: 'type',
          },
        ],
        icons: {
          mdiMagnify,
          mdiPencil,
          mdiDelete,
          mdiPlus,
        },
        inventory: {},
        inventories: [],
        isInventoriesLoading: true,
        inventoriesUrl: 'inventory',
        breadcrumbs: [
          {
            text: 'Dashboard',
            disabled: false,
            to: { name: 'dashboard' },
          },
          {
            text: 'Shops',
            disabled: false,
            to: { name: 'shops' },
          },
          {
            text: 'Inventories',
            disabled: false,
            to: { name: 'inventories' },
          },
        ],
        shopId: this.$route.params.id,
      }
    },
    computed: {
      refreshTable() {
        return `${this.inventoriesUrl}|${this.search}|${this.sortBy}|${this.sortDesc}`
      },
    },
    watch: {
      options: {
        handler() {
          this.getInventories()
        },
        deep: true,
      },
      refreshTable() {
        this.getInventories()
      },
      searchColumn() {
        if (this.search !== '') {
          this.getInventories()
        }
      },
    },
    mounted() {
      this.getInventories()
    },
    methods: {
      getInventories: _.debounce(function () {
        this.isInventoriesLoading = true
        const id = this.$route.params.id;
        const {
          sortBy, sortDesc, page, itemsPerPage,
        } = this.options
        const sortOrder = sortDesc[0] ? 'desc' : 'asc'
        axios
          .get(
            `${this.inventoriesUrl}?paginate=true&sortBy=${sortBy[0]}&sortDirection=${sortOrder}&search=${this.search}&searchColumn=${this.searchColumn}&page=${page}&perPage=${itemsPerPage}&shopId=${id}`,
          )
          .then(response => {
            this.inventories = response.data.data
            this.pagination.page = response.data.current_page
            this.pagination.pageCount = response.data.last_page
            this.pagination.itemsPerPage = response.data.per_page
            this.pagination.totalItems = response.data.total
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.isInventoriesLoading = false
            this.isInventoriesRefreshing = false
          })
      }, 500),
      refreshInventories() {
        this.isInventoriesRefreshing = true
        this.getInventories()
      },
      editInventory(inventory) {
        this.inventory = inventory
        this.showAddInventoryDialog = true
      },
      showDeleteInventoryDialog(id) {
        this.showConfirmDeleteDialog = true
        this.toDelete = id
      },
      deleteSelectedInventories() {
        this.isConfirmBulkDeleteDialogButtonLoading = true
        const selectedIds = this.selected.map(inventories => inventories.id)
        axios
          .delete('bulk-delete/inventory', { data: { ids: selectedIds } })
          .then(() => {
            this.selected = []
            this.getInventories()
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmBulkDeleteDialog = false
            this.isConfirmBulkDeleteDialogButtonLoading = false
          })
      },
      deleteInventory() {
        this.isConfirmDeleteDialogButtonLoading = true
        axios
          .delete(`inventory/${this.toDelete}`)
          .then(() => {
            this.refreshInventories()
            this.$toast.success('Inventory deleted successfully')
          }).catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.showConfirmDeleteDialog = false
            this.isConfirmDeleteDialogButtonLoading = false
          })
      },
      onInventoryAdded() {
        this.refreshInventories()
      },
      onInventoryUpdated() {
        this.refreshInventories()
      },
      onPageChange() {
        this.getInventories()
      },
      onSearchFilterChange(filter) {
        this.searchColumn = filter
      },
    },
  }
  </script>