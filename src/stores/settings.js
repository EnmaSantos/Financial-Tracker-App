import { ref } from 'vue'
import { defineStore } from 'pinia'
import { pingOllama } from '../lib/ollama'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'cardwise_settings'

export const useSettingsStore = defineStore('settings', () => {
  const ollamaHost = ref(import.meta.env.VITE_OLLAMA_HOST || 'http://localhost:11434')
  const ollamaModel = ref(import.meta.env.VITE_OLLAMA_MODEL || 'gemma3:4b')
  const ollamaOnline = ref(false)

  const resendApiKey = ref('')
  const telegramBotToken = ref('')
  const telegramChatId = ref('')
  const notificationEmail = ref('')

  function loadSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      if (stored.ollamaHost) ollamaHost.value = stored.ollamaHost
      if (stored.ollamaModel) ollamaModel.value = stored.ollamaModel
      if (stored.resendApiKey) resendApiKey.value = stored.resendApiKey
      if (stored.telegramBotToken) telegramBotToken.value = stored.telegramBotToken
      if (stored.telegramChatId) telegramChatId.value = stored.telegramChatId
      if (stored.notificationEmail) notificationEmail.value = stored.notificationEmail
    } catch {
      // ignore parse errors
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ollamaHost: ollamaHost.value,
      ollamaModel: ollamaModel.value,
      resendApiKey: resendApiKey.value,
      telegramBotToken: telegramBotToken.value,
      telegramChatId: telegramChatId.value,
      notificationEmail: notificationEmail.value
    }))
  }

  async function saveToSupabase() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        resend_api_key: resendApiKey.value,
        telegram_bot_token: telegramBotToken.value,
        telegram_chat_id: telegramChatId.value,
        notification_email: notificationEmail.value
      }, { onConflict: 'user_id' })

    if (error) throw error
  }

  async function saveSettings() {
    saveToLocalStorage()
    await saveToSupabase()
  }

  async function checkOllamaStatus() {
    ollamaOnline.value = await pingOllama(ollamaHost.value)
  }

  loadSettings()

  return {
    ollamaHost,
    ollamaModel,
    ollamaOnline,
    resendApiKey,
    telegramBotToken,
    telegramChatId,
    notificationEmail,
    loadSettings,
    saveSettings,
    checkOllamaStatus
  }
})
