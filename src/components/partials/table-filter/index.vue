<template>
  <div class="text-center">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-width="150"
      offset-y
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          class="text-none"
          v-on="on"
        >
          <v-icon
            left
            size="16"
          >
            {{ icons.mdiFilter }}
          </v-icon>
          <span class="font-weight-regular">Filter by {{ tableName }}</span>
          <span
            v-if="tableName !== ''"
            class="font-weight-black"
            style="margin-left:3px"
          > from </span>
          <span
            class="font-weight-black"
            style="margin-left:3px"
          > {{ filterLabel }}</span>
          <v-icon
            right
            size="16"
          >
            {{ icons.mdiChevronDown }}
          </v-icon>
        </v-btn>
      </template>

      <v-card>
        <loan-status-filter
          v-if="showLoanStatusFilter"
          :initial-filters="filters.loanStatus"
          @status-change="onLoanStatus"
        />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            small
            @click="onFilterButtonClick"
          >
            Filter
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import {
  mdiFilter,
  mdiChevronDown,
} from '@mdi/js'
import LoanStatusFilter from './LoanStatusFilter.vue'

export default {
  components: {
    LoanStatusFilter,
  },
  props: {
    tableName: {
      type: String,
      default: '',
    },
    showLoanStatusFilter: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: '',
    },
    initialFilters: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      fav: true,
      menu: false,
      message: false,
      hints: true,
      icons: {
        mdiFilter,
        mdiChevronDown,
      },
      filterLabel: 'Last 30 days',
      filters: {},
    }
  },
  watch: {
    label(value) {
      this.filterLabel = value
    },
  },
  mounted() {
    if (this.initialFilters) {
      this.filters = this.initialFilters
    }
    this.filterLabel = this.label
    if (this.label === '' && this.showLoanStatusFilter) {
      this.filterLabel = 'all loans'
    }
  },
  methods: {
    onLoanStatus(value) {
      this.filters.loanStatus = value.filters
      if (value.label !== 'all loans') {
        this.filterLabel = `${value.label} loans`

        return
      }
      this.filterLabel = value.label
    },
    onFilterButtonClick() {
      this.menu = false
      this.$emit('filter', {
        filters: this.filters,
        label: this.filterLabel,
      })
    },

  },

}
</script>
