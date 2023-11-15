<template>
  <div style="min-width: 511px">
    <v-card-title class="pb-0 green darken-4">
      <p class="body-1 font-weight-medium">
        Status
      </p>
    </v-card-title>

    <v-divider></v-divider>
    <v-card-text>
      <v-row>
        <v-col>
          <v-checkbox
            v-model="filters.overdue"
            label="Overdue"
            @change="onCheckboxChange"
          ></v-checkbox>
        </v-col>
        <v-col>
          <v-checkbox
            v-model="filters.fined"
            label="Fined"
            @change="onCheckboxChange"
          ></v-checkbox>
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script>
export default {
  props: {
    initialFilters: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      filters: {
        overdue: false,
        fined: false,
      },
      filterLabel: 'all loans',
    }
  },
  mounted() {
    this.filters = this.initialFilters
    this.onCheckboxChange()
  },
  methods: {
    onCheckboxChange() {
      this.generateFilterLabel()
      const data = {
        filters: this.filters,
        label: this.filterLabel,
      }
      this.$emit('status-change', data)
    },
    generateFilterLabel() {
      const labels = []
      if (this.filters.overdue) {
        labels.push('overdue')
      }
      if (this.filters.fined) {
        labels.push('fined')
      }
      if (labels.length === 0) {
        this.filterLabel = 'all loans'

        return
      }
      this.filterLabel = labels[0]
      if (labels.length === 2) {
        this.filterLabel = `${this.filterLabel} and ${labels[1]}`
      }
      if (labels.length === 3) {
        this.filterLabel = `${this.filterLabel}, ${labels[1]} and ${labels[2]}`
      }
    },
  },
}
</script>
