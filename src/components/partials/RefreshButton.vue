<template>
    <v-btn
      :disabled="loading"
      class="text-none"
      @click="$emit('click')"
    >
      Refresh
      <v-icon
        right
        :class="{ rotating: loading }"
      >
        {{ icons.mdiCached }}
      </v-icon>
    </v-btn>
  </template>
  
  <script>import {
    mdiCached,
  } from '@mdi/js'
  export default {
    props: {
      loading: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        icons: {
          mdiCached,
        },
      }
    },
  }
  </script>
  
  <style>
  .rotating {
    -webkit-animation: rotation 2s infinite linear;
    animation: rotation 2s infinite linear;
  }
  @keyframes rotation{
    from {
  -webkit-transform: rotate(0deg);
  }
  to {
  -webkit-transform: rotate(359deg);
  }
  }
  @-webkit-keyframes rotation {
  from {
  -webkit-transform: rotate(0deg);
  }
  to {
  -webkit-transform: rotate(359deg);
  }
  }
  </style>