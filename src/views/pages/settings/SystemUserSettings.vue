<template>
  <div class="user-settings pb-10">
    <v-card
      flat
      class="pa-3 mt-2"
    >
      <h1 class="text-center">
        System Users
      </h1>
      <p class="text-center">
        The users listed below will be able to login and manage the system.
      </p>
      <v-row>
        <v-spacer></v-spacer>
        <v-col
          class="text-right mt-3 mr-8"
          cols="6"
        >
          <v-btn
            color="primary"
            @click="showAddSystemUserDialog = true"
          >
            <v-icon
              left
              size="22"
            >
              {{ icons.mdiPlus }}
            </v-icon>
            Add System User
          </v-btn>
        </v-col>
      </v-row>
      <v-row
        justify="center"
        class="mb-0"
      >
        <v-col class="col-md-6 text-center">
          <search-input
            v-model="search"
            :filters="searchFilters"
            :active-filter="searchColumn"
            @filter-change="onSearchFilterChange"
          />
        </v-col>
      </v-row>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="systemUsers"
        :loading="isSystemUsersLoading"
        :options.sync="options"
        :footer-props="footerProps"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn
            ma-4
            text
            icon
            @click="showDeleteSystemUserDialog(item.id) "
          >
            <v-icon>
              {{ icons.mdiDelete }}
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <add-system-user-dialog
      :show-dialog="showAddSystemUserDialog"
      :user="systemUser"
      @close="
        showAddSystemUserDialog = false
        user = {}
      "
      @user-added="getSystemUsers()"
    />
    <confirm-dialog
      :show-dialog="showConfirmDeleteDialog"
      :is-agree-button-loading="isConfirmDeleteDialogButtonLoading"
      :agree-text="'Delete'"
      @cancel="
        showConfirmDeleteDialog = false
        user = {}
      "
      @agree="deleteSystemUser()"
    />
  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
import {
  mdiDelete,
  mdiPlus,
} from '@mdi/js'
import AddSystemUserDialog from '@/components/dialogs/AddSystemUserDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import SearchInput from '@/components/partials/SearchInput.vue'

export default {
  components: {
    AddSystemUserDialog,
    ConfirmDialog,
    SearchInput,
  },
  data() {
    return {
      icons: {
        mdiDelete,
        mdiPlus,
      },
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Phone Number', value: 'phone_number' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      systemUsers: [],
      selected: [],
      isSystemUsersLoading: true,
      isConfirmDeleteDialogButtonLoading: false,
      showAddSystemUserDialog: false,
      showConfirmDeleteDialog: false,
      search: '',
      searchFilters: ['Name', 'Email'],
      searchColumn: 'Name',
      systemUser: {},
      options: {
        itemsPerPage: 10,
        page: 1,
        sortBy: ['name'],
        sortDesc: [false],
      },
      footerProps: {
        itemsPerPageOptions: [10, 20, 50],
      },
    }
  },
  watch: {
    options: {
      handler() {
        this.getSystemUsers()
      },
      deep: true,
    },
    search: {
      handler: _.debounce(function () {
        this.getSystemUsers()
      }, 500),
      immediate: true,
    },
  },
  mounted() {
    this.getSystemUsers()
  },
  methods: {
    getSystemUsers() {
      this.isSystemUsersLoading = true
      axios.get('users', {
        params: {
          search: this.search,
          column: this.searchColumn,
          ...this.options,
        },
      })
        .then(response => {
          this.systemUsers = response.data.data
        })
        .catch(error => {
          console.error(error)
        })
        .finally(() => {
          this.isSystemUsersLoading = false
        })
    },
    showDeleteSystemUserDialog(userId) {
      this.systemUser = this.systemUsers.find(systemUser => systemUser.id === userId)
      this.showConfirmDeleteDialog = true
    },
    deleteSystemUser() {
      this.isConfirmDeleteDialogButtonLoading = true
      axios.delete(`users/${this.systemUser.id}`)
        .then(() => {
          this.systemUser = {}
          this.getSystemUsers()
        })
        .catch(error => {
          console.error(error)
          this.$toast.error(error.response.data.message)
        })
        .finally(() => {
          this.isConfirmDeleteDialogButtonLoading = false
          this.showConfirmDeleteDialog = false
        })
    },
    onSystemUserAdded(systemUser) {
      this.systemUsers.push(systemUser)
    },
    onSearchFilterChange(filter) {
      this.searchColumn = filter
    },
  },
}
</script>
