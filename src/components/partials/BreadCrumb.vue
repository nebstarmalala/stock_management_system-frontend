<template>
    <v-breadcrumbs :items="items">
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          :to="item.to"
          class="text-subtitle-2 crumb-item"
          :disabled="item.disabled"
          exact
        >
          {{ item.text }}
        </v-breadcrumbs-item>
      </template>
      <template v-slot:divider>
        <v-icon>{{ icons.mdiChevronRight }}</v-icon>
      </template>
    </v-breadcrumbs>
  </template>
  
  <script>
  import {
    mdiChevronRight,
  } from '@mdi/js'
  export default {
    props: {
      items: {
        type: Array,
        default: null,
      },
    },
    data: () => ({
      icons: {
        mdiChevronRight,
      },
    }),
  }
  </script>
  
  <style>
  </style>