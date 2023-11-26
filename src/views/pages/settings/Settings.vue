<template>
  <v-card id="account-setting-card">
    <!-- tabs -->
    <v-tabs
      v-model="tab"
      show-arrows
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.path"
        :href="'#' + tab.path"
      >
        <v-icon
          size="20"
          class="me-3"
        >
          {{ tab.icon }}
        </v-icon>
        <span>{{ tab.title }}</span>
      </v-tab>
    </v-tabs>

    <!-- tabs item -->
    <v-tabs-items v-model="tab">
      <v-tab-item value="account">
        <account-settings />
      </v-tab-item>

      <v-tab-item value="security">
        <security-settings />
      </v-tab-item>

      <v-tab-item value="system-settings">
        <system-settings />
      </v-tab-item>

      <v-tab-item value="system-users">
        <system-user-settings />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import {
  mdiAccountOutline, mdiLockOpenOutline, mdiApplicationCog, mdiInformationOutline, mdiAccountMultiple, mdiAdjust, mdiViewStream,
} from '@mdi/js'
import AccountSettings from './AccountSettings.vue'
import SecuritySettings from './SecuritySettings.vue'
import SystemSettings from './SystemSettings.vue'
import SystemUserSettings from './SystemUserSettings.vue'

export default {
  components: {
    AccountSettings,
    SecuritySettings,
    SystemSettings,
    SystemUserSettings,
  },
  setup() {
    // tabs
    const tabs = [
      { title: 'Account', path: 'account', icon: mdiAccountOutline },
      { title: 'Security', path: 'security', icon: mdiLockOpenOutline },
      { title: 'System Settings', path: 'system-settings', icon: mdiApplicationCog },
      { title: 'System Users', path: 'system-users', icon: mdiAccountMultiple },
    ]

    return {
      tabs,
      icons: {
        mdiAccountOutline,
        mdiLockOpenOutline,
        mdiInformationOutline,
        mdiAccountMultiple,
        mdiAdjust,
        mdiViewStream,
      },
    }
  },
  computed: {
    tab: {
      set(tab) {
        this.$router.replace({ query: { ...this.$route.query, tab } })
      },
      get() {
        return this.$route.query.tab
      },
    },
  },
}
</script>
