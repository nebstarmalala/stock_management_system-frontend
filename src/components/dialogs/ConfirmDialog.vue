<template>
  <v-dialog
    v-model="showDialog"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
    @keydown.esc="cancel"
    @click:outside="cancel"
  >
    <v-card>
      <v-toolbar
        dense
        flat
      >
        <v-toolbar-title class="text-body-2 font-weight-bold">
          {{ title }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text
        v-show="!!message"
        class="mt-1"
      >
        {{ message }}
      </v-card-text>
      <v-card-text
        v-show="!!secondaryMessage"
        class="mt-1 text-center"
      >
        <h2>{{ secondaryMessage }}</h2>
      </v-card-text>
      <v-card-actions class="pt-3">
        <v-spacer></v-spacer>
        <v-btn
          v-if="showCancelButton"
          color="grey"
          text
          class="body-2 font-weight-bold"
          @click.native="cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          class="body-2 font-weight-bold"
          outlined
          :loading="isAgreeButtonLoading"
          @click.native="agree"
        >
          {{ agreeText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    showDialog: {
      type: Boolean,
    },
    showCancelButton: {
      type: Boolean,
      default: true,
    },
    isAgreeButtonLoading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Confirm',
    },
    message: {
      type: String,
      default: 'Are you sure you want to delete this record?',
    },
    secondaryMessage: {
      type: String,
      default: null,
    },
    agreeText: {
      type: String,
      default: 'OK',
    },
  },
  data: () => ({
    options: {
      color: 'grey lighten-3',
      width: 400,
      zIndex: 200,
      noConfirm: false,
    },
  }),
  methods: {
    agree() {
      this.dialog = false
      this.$emit('agree')
    },
    cancel() {
      this.dialog = false
      this.$emit('cancel')
    },
  },
}
</script>

<style>
</style>
