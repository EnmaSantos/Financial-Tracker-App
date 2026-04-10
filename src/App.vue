<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import BottomNav from './components/BottomNav.vue'
import Toast from './components/Toast.vue'

const auth = useAuthStore()
const settings = useSettingsStore()

onMounted(async () => {
  await auth.initialize()
  settings.checkOllamaStatus()
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
  <BottomNav v-if="auth.isAuthenticated" />
  <Toast />
</template>
