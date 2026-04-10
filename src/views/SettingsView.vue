<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { sendEmail } from '../lib/resend'
import { testConnection } from '../lib/telegram'

const settings = useSettingsStore()
const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const testingOllama = ref(false)
const testingResend = ref(false)
const testingTelegram = ref(false)
const saving = ref(false)

async function testOllama() {
  testingOllama.value = true
  await settings.checkOllamaStatus()
  testingOllama.value = false
  if (settings.ollamaOnline) {
    toast.success('Ollama is online!')
  } else {
    toast.error('Cannot reach Ollama')
  }
}

async function testResendEmail() {
  if (!settings.resendApiKey || !settings.notificationEmail) {
    toast.error('Set API key and email first')
    return
  }
  testingResend.value = true
  try {
    await sendEmail(settings.resendApiKey, {
      to: settings.notificationEmail,
      subject: 'CardWise Test',
      html: '<p>This is a test email from CardWise.</p>'
    })
    toast.success('Test email sent!')
  } catch (err) {
    toast.error(err.message)
  } finally {
    testingResend.value = false
  }
}

async function testTelegramBot() {
  if (!settings.telegramBotToken || !settings.telegramChatId) {
    toast.error('Set bot token and chat ID first')
    return
  }
  testingTelegram.value = true
  const result = await testConnection(settings.telegramBotToken, settings.telegramChatId)
  testingTelegram.value = false
  if (result.ok) {
    toast.success('Telegram connected!')
  } else {
    toast.error(result.error)
  }
}

async function handleSave() {
  saving.value = true
  try {
    await settings.saveSettings()
    toast.success('Settings saved')
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

async function handleSignOut() {
  await auth.signOut()
  router.push('/auth')
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="headline-md">Settings</h1>
    </div>

    <!-- Ollama -->
    <section class="settings-section">
      <div class="section-header">
        <h2 class="title-md">AI (Ollama)</h2>
        <span class="badge" :class="settings.ollamaOnline ? 'badge-online' : 'badge-offline'">
          {{ settings.ollamaOnline ? 'Online' : 'Offline' }}
        </span>
      </div>
      <div class="input-group">
        <label class="label-sm input-label">Host URL</label>
        <input v-model="settings.ollamaHost" class="input" placeholder="http://localhost:11434" />
      </div>
      <div class="input-group">
        <label class="label-sm input-label">Model</label>
        <input v-model="settings.ollamaModel" class="input" placeholder="gemma3:4b" />
      </div>
      <button class="btn btn-secondary" @click="testOllama" :disabled="testingOllama">
        {{ testingOllama ? 'Testing...' : 'Test Connection' }}
      </button>
    </section>

    <!-- Resend -->
    <section class="settings-section">
      <h2 class="title-md">Email (Resend)</h2>
      <div class="input-group">
        <label class="label-sm input-label">API Key</label>
        <input v-model="settings.resendApiKey" class="input" type="password" placeholder="re_..." />
      </div>
      <div class="input-group">
        <label class="label-sm input-label">Notification Email</label>
        <input v-model="settings.notificationEmail" class="input" type="email" placeholder="you@example.com" />
      </div>
      <button class="btn btn-secondary" @click="testResendEmail" :disabled="testingResend">
        {{ testingResend ? 'Sending...' : 'Send Test Email' }}
      </button>
    </section>

    <!-- Telegram -->
    <section class="settings-section">
      <h2 class="title-md">Telegram</h2>
      <div class="input-group">
        <label class="label-sm input-label">Bot Token</label>
        <input v-model="settings.telegramBotToken" class="input" type="password" placeholder="123456:ABC..." />
      </div>
      <div class="input-group">
        <label class="label-sm input-label">Chat ID</label>
        <input v-model="settings.telegramChatId" class="input" placeholder="123456789" />
      </div>
      <button class="btn btn-secondary" @click="testTelegramBot" :disabled="testingTelegram">
        {{ testingTelegram ? 'Sending...' : 'Send Test Message' }}
      </button>
    </section>

    <!-- Save -->
    <button class="btn btn-primary btn-full" style="margin-top: 24px" :disabled="saving" @click="handleSave">
      {{ saving ? 'Saving...' : 'Save Settings' }}
    </button>

    <!-- Sign Out -->
    <section class="settings-section" style="margin-top: 32px">
      <button class="btn btn-danger btn-full" @click="handleSignOut">
        Sign Out
      </button>
    </section>
  </div>
</template>

<style scoped>
.settings-section {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
