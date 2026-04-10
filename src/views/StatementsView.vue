<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useCardsStore } from '../stores/cards'
import { useTransactionsStore } from '../stores/transactions'
import { useToast } from '../composables/useToast'
import { parseStatement } from '../lib/ollama'
import { uploadFile, supabase } from '../lib/supabase'
import TransactionList from '../components/TransactionList.vue'

const settings = useSettingsStore()
const cards = useCardsStore()
const txnStore = useTransactionsStore()
const toast = useToast()

const selectedCardId = ref('')
const file = ref(null)
const parsing = ref(false)
const saving = ref(false)
const parsedTxns = ref([])

onMounted(() => {
  if (!cards.cards.length) cards.fetchCards()
  settings.checkOllamaStatus()
})

function onFileSelect(e) {
  file.value = e.target.files[0] || null
}

async function handleParse() {
  if (!file.value || !selectedCardId.value) return
  parsing.value = true
  parsedTxns.value = []

  try {
    let content
    const mimeType = file.value.type

    if (mimeType.startsWith('image/')) {
      const buffer = await file.value.arrayBuffer()
      content = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    } else {
      content = await file.value.text()
    }

    const result = await parseStatement(content, mimeType, settings.ollamaHost, settings.ollamaModel)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    parsedTxns.value = result.transactions.map((t, i) => ({ ...t, _idx: i }))
    toast.success(`Extracted ${parsedTxns.value.length} transactions`)
  } catch (err) {
    toast.error(err.message)
  } finally {
    parsing.value = false
  }
}

function handleEditTxn(txn, idx) {
  const desc = prompt('Description:', txn.description)
  if (desc === null) return
  const amount = prompt('Amount:', txn.amount)
  if (amount === null) return
  parsedTxns.value[idx] = { ...parsedTxns.value[idx], description: desc, amount: Number(amount) }
}

function handleDeleteTxn(txn, idx) {
  parsedTxns.value.splice(idx, 1)
}

async function handleSave() {
  if (!parsedTxns.value.length || !selectedCardId.value) return
  saving.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (file.value) {
      const ext = file.value.name.split('.').pop()
      const path = `${user.id}/${selectedCardId.value}_${Date.now()}.${ext}`
      await uploadFile('statements', path, file.value)
    }

    await txnStore.saveTransactions(selectedCardId.value, parsedTxns.value)
    toast.success('Transactions saved!')
    parsedTxns.value = []
    file.value = null
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="headline-md">Statements</h1>
      <div style="margin-top: 12px">
        <span class="badge" :class="settings.ollamaOnline ? 'badge-online' : 'badge-offline'">
          <span class="urgency-dot" :class="settings.ollamaOnline ? 'safe' : 'danger'" />
          {{ settings.ollamaOnline ? 'AI Online' : 'AI Unavailable' }}
        </span>
      </div>
    </div>

    <!-- Card Selector -->
    <div class="input-group">
      <label class="label-sm input-label">Select Card</label>
      <select v-model="selectedCardId" class="input">
        <option value="">Choose a card...</option>
        <option v-for="card in cards.cards" :key="card.id" :value="card.id">
          {{ card.name }} {{ card.last4 ? `(*${card.last4})` : '' }}
        </option>
      </select>
    </div>

    <!-- Upload Zone -->
    <div
      class="upload-zone"
      :class="{ disabled: !settings.ollamaOnline }"
      style="margin-top: 20px"
      @click="!settings.ollamaOnline ? null : $refs.fileInput.click()"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <span class="body-md">
        {{ file ? file.name : settings.ollamaOnline ? 'Upload PDF or photo of statement' : 'Connect to home network to use AI parsing' }}
      </span>
      <input
        ref="fileInput"
        type="file"
        accept="image/*,application/pdf,.txt,.csv"
        style="display: none"
        @change="onFileSelect"
      />
    </div>

    <!-- Parse Button -->
    <button
      class="btn btn-primary btn-full"
      style="margin-top: 16px"
      :disabled="!file || !selectedCardId || !settings.ollamaOnline || parsing"
      @click="handleParse"
    >
      {{ parsing ? 'Parsing...' : 'Parse with AI' }}
    </button>

    <!-- Parsed Transactions Review -->
    <div v-if="parsedTxns.length" class="section-gap">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px">
        <h2 class="headline-md">Review Transactions</h2>
        <span class="label-sm" style="color: var(--on-surface-variant)">{{ parsedTxns.length }} found</span>
      </div>

      <TransactionList
        :transactions="parsedTxns"
        :editable="true"
        @edit="handleEditTxn"
        @delete="handleDeleteTxn"
      />

      <button
        class="btn btn-primary btn-full"
        style="margin-top: 20px"
        :disabled="saving"
        @click="handleSave"
      >
        {{ saving ? 'Saving...' : 'Save Transactions' }}
      </button>
    </div>
  </div>
</template>
