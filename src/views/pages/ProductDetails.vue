<template>
    <div class="book-copies">
      <v-row>
        <v-col
          md="10"
          sm="12"
        >
          <breadcrumb :items="breadcrumbs" />
        </v-col>
        <v-col
          md="2"
          sm="12"
        >
          <v-btn
            class="go-back-button"
            @click="$router.go(-1)"
          >
            <v-icon class="mr-1">
              {{ icons.mdiArrowLeft }}
            </v-icon>
            Go back
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
                  :loading="isBookCopiesRefreshing"
                  @click="refreshBookCopies()"
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
          <v-data-table
            :headers="headers"
            :items="bookCopies"
            :loading="isBookCopiesLoading"
            :server-items-length="pagination.totalItems"
            :options.sync="options"
            :footer-props="footerProps"
          >
            <template v-slot:item.created_at="{ item }">
              {{ item.created_at | formatDate }}
            </template>
            <template v-slot:item.action="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    ma-3
                    v-bind="attrs"
                    text
                    icon
                    @click="showBarCodeDialog = true; selectedBookCopy = item"
                    v-on="on"
                  >
                    <v-icon
                      v-bind="attrs"
                      v-on="on"
                    >
                      {{ icons.mdiReceipt }}
                    </v-icon>
                  </v-btn>
                </template>
                <span>View BarCode</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-expand-transition>
      <barcode-dialog
        :show-dialog="showBarCodeDialog"
        :message="selectedBookCopy.serial_number"
        @close="showBarCodeDialog = false"
      />
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import _ from 'lodash'
  import { mdiReceipt, mdiArrowLeft } from '@mdi/js'
  import BreadCrumb from '@/components/partials/BreadCrumb.vue'
  import SearchInput from '@/components/partials/SearchInput.vue'
  import RefreshButton from '@/components/partials/RefreshButton.vue'
  import BarcodeDialog from '@/components/dialogs/BarcodeDialog.vue'
  
  export default {
    components: {
      breadcrumb: BreadCrumb,
      SearchInput,
      RefreshButton,
      BarcodeDialog,
    },
    data() {
      return {
        bookId: this.$route.params.id,
        showBarCodeDialog: false,
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
        options: {},
        headers: [
          {
            text: 'Serial Number',
            value: 'serial_number',
          },
          {
            text: 'Status',
            value: 'status',
          },
          {
            text: 'Created At',
            value: 'created_at',
          },
          {
            text: 'Action',
            value: 'action',
            sortable: false,
          },
        ],
        searchColumn: 'serial_number',
        searchFilters: [
          {
            text: 'Serial Number',
            value: 'serial_number',
          },
        ],
        bookCopies: [],
        isBookCopiesLoading: true,
        isBookCopiesRefreshing: false,
        booksUrl: 'books',
        breadcrumbs: [
          {
            text: 'Dashboard',
            disabled: false,
            to: { name: 'dashboard' },
          },
          {
            text: 'Books',
            disabled: false,
            to: { name: 'books' },
          },
          {
            text: this.$route.params.id,
            disabled: true,
            to: { name: 'books' },
          },
        ],
        icons: {
          mdiReceipt,
          mdiArrowLeft,
        },
        selectedBookCopy: {},
      }
    },
    computed: {
      refreshTable() {
        return `${this.booksUrl}|${this.search}|${this.sortBy}|${this.sortDesc}`
      },
    },
    watch: {
      options: {
        handler() {
          this.getBookCopies()
        },
        deep: true,
      },
      refreshTable() {
        this.getBookCopies()
      },
      searchColumn() {
        if (this.search !== '') {
          this.getBookCopies()
        }
      },
    },
    mounted() {
      this.getBookCopies()
    },
    methods: {
      getBookCopies: _.debounce(function () {
        this.isBookCopiesLoading = true
        const {
          sortBy, sortDesc, page, itemsPerPage,
        } = this.options
        const sortOrder = sortDesc[0] ? 'desc' : 'asc'
        axios
          .get(
            `${this.booksUrl}/${this.bookId}?paginate=true&sortBy=${sortBy[0]}&sortDirection=${sortOrder}&search=${this.search}&searchColumn=${this.searchColumn}&page=${page}&perPage=${itemsPerPage}`,
          )
          .then(response => {
            this.bookCopies = response.data.copies.data
            this.pagination.page = response.data.copies.current_page
            this.pagination.pageCount = response.data.copies.last_page
            this.pagination.itemsPerPage = response.data.copies.per_page
            this.pagination.totalItems = response.data.copies.total
            this.breadcrumbs.pop()
            this.breadcrumbs.push({
              text: response.data.title,
              disabled: true,
              to: { name: 'books' },
            })
          })
          .catch(error => {
            this.$toast.error(error.response.data.message)
          }).finally(() => {
            this.isBookCopiesLoading = false
            this.isBookCopiesRefreshing = false
          })
      }, 500),
      refreshBookCopies() {
        this.isBookCopiesRefreshing = true
        this.getBookCopies()
      },
      onSearchFilterChange(filter) {
        this.searchColumn = filter
      },
    },
  }
  </script>
  