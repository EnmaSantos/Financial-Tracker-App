<script setup>
import { ref, onMounted } from 'vue'
import { useCardsStore } from '../stores/cards'
import { useToast } from '../composables/useToast'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal.vue'

const cards = useCardsStore()
const toast = useToast()

const reminders = ref([])
const logs = ref([])
const loading = ref(false)
const showModal = ref(false)
const showLogs = ref(false)

const form = ref({
  card_id: '',
  channel: 'both'
})

onMounted(() => {
  if (!cards.cards.length) cards.fetchCards()
  fetchReminders()
  fetchLogs()
})

async function fetchReminders() {
  loading.value = true
  const { data } = await supabase
    .from('reminders')
    .select('*, cards(name, last4)')
    .order('created_at', { ascending: false })
  reminders.value = data || []
  loading.value = false
}

async function fetchLogs() {
  const { data } = await supabase
    .from('notifications_log')
    .select('*, reminders(card_id, cards(name))')
    .order('sent_at', { ascending: false })
    .limit(50)
  logs.value = data || []
}

async function toggleReminder(reminder) {
  try {
    const { error } = await supabase
      .from('reminders')
      .update({ active: !reminder.active })
      .eq('id', reminder.id)
    if (error) throw error
    reminder.active = !reminder.active
  } catch (err) {
    toast.error(err.message)
  }
}

async function addReminder() {
  if (!form.value.card_id) return
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('reminders').insert({
      card_id: form.value.card_id,
      channel: form.value.channel,
      user_id: user.id
    })
    if (error) throw error
    toast.success('Reminder added')
    showModal.value = false
    fetchReminders()
  } catch (err) {
    toast.error(err.message)
  }
}

async function deleteReminder(id) {
  if (!confirm('Delete this reminder?')) return
  try {
    await supabase.from('reminders').delete().eq('id', id)
    reminders.value = reminders.value.filter(r => r.id !== id)
    toast.success('Reminder deleted')
  } catch (err) {
    toast.error(err.message)
  }
}

function cardName(reminder) {
  return reminder.cards?.name || 'Unknown Card'
}

function cardLast4(reminder) {
  return reminder.cards?.last4 ? `*${reminder.cards.last4}` : ''
}

function channelLabel(ch) {
  return { email: 'Email', telegram: 'Telegram', both: 'Email + Telegram' }[ch] || ch
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="headline-md">Reminders</h1>
    </div>

    <!-- Active Reminders -->
    <div v-if="loading" class="skeleton-list">
      <div class="skeleton" style="height: 72px" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="!reminders.length" class="empty-state">
      <span class="body-md">No reminders set up</span>
      <button class="btn btn-primary" @click="showModal = true">Add Reminder</button>
    </div>

    <div v-else class="reminders-list">
      <div v-for="r in reminders" :key="r.id" class="reminder-row">
        <div class="reminder-info">
          <span class="title-md">{{ cardName(r) }}</span>
          <span class="label-sm" style="color: var(--on-surface-variant)">
            {{ cardLast4(r) }} &middot; {{ channelLabel(r.channel) }}
          </span>
        </div>
        <div class="reminder-actions">
          <div
            class="toggle"
            :class="{ active: r.active }"
            @click="toggleReminder(r)"
          />
          <button class="btn-sm" style="color: var(--error-glow)" @click="deleteReminder(r.id)">Del</button>
        </div>
      </div>
    </div>

    <button class="fab" @click="showModal = true">+</button>

    <!-- Notification Log -->
    <div class="section-gap">
      <button class="btn-tertiary" @click="showLogs = !showLogs" style="margin-bottom: 12px">
        {{ showLogs ? 'Hide' : 'Show' }} Notification Log ({{ logs.length }})
      </button>
      <div v-if="showLogs && logs.length" class="logs-list">
        <div v-for="log in logs" :key="log.id" class="log-row">
          <div>
            <span class="body-md">{{ log.reminders?.cards?.name || 'Unknown' }}</span>
            <span class="label-sm" style="color: var(--on-surface-variant); margin-left: 8px">
              {{ new Date(log.sent_at).toLocaleString() }}
            </span>
          </div>
          <span class="badge" :class="log.status === 'sent' ? 'badge-online' : 'badge-offline'">
            {{ log.status }}
          </span>
        </div>
      </div>
      <div v-if="showLogs && !logs.length" class="empty-state" style="padding: 16px">
        <span class="body-md">No notifications sent yet</span>
      </div>
    </div>

    <!-- Add Reminder Modal -->
    <Modal v-if="showModal" title="Add Reminder" @close="showModal = false">
      <form @submit.prevent="addReminder">
        <div class="input-group">
          <label class="label-sm input-label">Card</label>
          <select v-model="form.card_id" class="input" required>
            <option value="">Select a card...</option>
            <option v-for="card in cards.cards" :key="card.id" :value="card.id">
              {{ card.name }} {{ card.last4 ? `(*${card.last4})` : '' }}
            </option>
          </select>
        </div>
        <div class="input-group" style="margin-top: 16px">
          <label class="label-sm input-label">Channel</label>
          <select v-model="form.channel" class="input">
            <option value="email">Email</option>
            <option value="telegram">Telegram</option>
            <option value="both">Email + Telegram</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary btn-full" style="margin-top: 20px">
          Add Reminder
        </button>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reminder-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--surface-high);
  border-radius: var(--radius-lg);
}

.reminder-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reminder-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-radius: var(--radius-md);
}

.log-row:nth-child(odd) {
  background: var(--surface-low);
}

.btn-sm {
  font-size: 0.75rem;
  padding: 4px 8px;
  cursor: pointer;
  background: none;
}
</style>
