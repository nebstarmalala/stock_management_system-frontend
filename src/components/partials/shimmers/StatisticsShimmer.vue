<template>
  <v-col>
    <v-row class="mt-1">
      <v-col cols="3">
        <vue-skeleton-loader
          rounded
          :width="54"
          :height="54"
        />
      </v-col>
      <v-col>
        <vue-skeleton-loader
          class="mt-1"
          :width="60"
          :height="12"
        />
        <vue-skeleton-loader
          class="mt-1"
          :width="20"
          :height="14"
        />
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
import VueSkeletonLoader from 'skeleton-loader-vue'

export default {
  components: {
    VueSkeletonLoader,
  },

}
</script>

<style>

</style>
