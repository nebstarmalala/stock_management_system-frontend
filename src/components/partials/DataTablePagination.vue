<template>
  <v-row class="mt-2">
    <v-col
      cols="4"
      class="pt-6"
    >
      <v-row>
        <v-col cols="5">
          <label class="body-2 ml-4">Items per page: </label>
        </v-col>
        <v-col
          cols="3"
          class="pt-2"
        >
          <v-select
            v-model="pagination.itemsPerPage"
            :items="itemsPerPageList"
            dense
            @change="onItemsPerPageChange"
          ></v-select>
        </v-col>
      </v-row>
    </v-col>
    <v-col
      cols="8"
      class="d-flex justify-left "
    >
      <v-pagination
        v-model="pagination.page"
        class="mt-1"
        :length="pagination.pageCount"
        :total-visible="8"
        @input="onPageChange"
      ></v-pagination>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    page: {
      type: Number,
      default: 1,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      pagination: {
        page: 1,
        itemsPerPage: 10,
        pageCount: 1,
      },
      itemsPerPageList: [10, 20, 50, 100],
    }
  },
  watch: {
    page(newPage) {
      this.pagination.page = newPage
    },
    pageCount(newPageCount) {
      this.pagination.pageCount = newPageCount
    },
  },
  methods: {
    onPageChange() {
      this.$emit('page-change', this.pagination.page)
    },
    onItemsPerPageChange() {
      this.$emit('items-per-page-change', this.pagination.itemsPerPage)
    },
  },

}
</script>
