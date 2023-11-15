<template>
    <v-col
      class="d-md-flex"
    >
      <v-select
        v-model="filter"
        :items="filters"
        item-text="text"
        item-value="value"
        rounded
        outlined
        dense
        label="Search by"
        class="rounded-r-md-0"
        @change="$emit('filter-change', filter)"
      ></v-select>
      <v-text-field
        rounded
        outlined
        dense
        label="Search"
        :append-icon="icons.mdiMagnify"
        class="app-bar-search flex-grow-0 rounded-l-md-0 col-2"
        hide-details
        :value="value"
        @input="$emit('input', $event)"
      ></v-text-field>
    </v-col>
  </template>
  
  <script>
  import { mdiMagnify } from '@mdi/js'
  export default {
    props: {
      value: {
        type: String,
        default: null,
      },
      filters: {
        type: Array,
        default: () => [],
      },
      activeFilter: {
        type: String,
        default: null,
      },
    },
    data() {
      return {
        content: this.value,
        icons: {
          mdiMagnify,
        },
        filter: this.activeFilter,
      }
    },
    methods: {
      handleInput() {
        this.$emit('input', this.content)
      },
    },
  }
  </script>
  
  <style scoped>
    @media (min-width: 768px) {
      .rounded-r-md-0 {
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
      }
      .rounded-l-md-0 {
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
      }
    }
  </style>