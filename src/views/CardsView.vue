<script setup>
import { ref, onMounted } from 'vue'
import { useCardsStore } from '../stores/cards'
import { useAccountsStore } from '../stores/accounts'
import { useToast } from '../composables/useToast'
import CardItem from '../components/CardItem.vue'
import Modal from '../components/Modal.vue'

const cards = useCardsStore()
const accounts = useAccountsStore()
const toast = useToast()

const showModal = ref(false)
const editingCard = ref(null)
const saving = ref(false)

const form = ref({
  name: '',
  last4: '',
  credit_limit: '',
  balance: '',
  min_payment: '',
  apr: '',
  statement_date: '',
  due_date: '',
  linked_account_id: ''
})

onMounted(() => {
  cards.fetchCards()
  accounts.fetchAccounts()
})

function openAdd() {
  editingCard.value = null
  form.value = {
    name: '', last4: '', credit_limit: '', balance: '',
    min_payment: '', apr: '', statement_date: '', due_date: '',
    linked_account_id: ''
  }
  showModal.value = true
}

function openEdit(card) {
  editingCard.value = card
  form.value = {
    name: card.name || '',
    last4: card.last4 || '',
    credit_limit: card.credit_limit ?? '',
    balance: card.balance ?? '',
    min_payment: card.min_payment ?? '',
    apr: card.apr ?? '',
    statement_date: card.statement_date ?? '',
    due_date: card.due_date ?? '',
    linked_account_id: card.linked_account_id || ''
  }
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const data = {
      name: form.value.name,
      last4: form.value.last4 || null,
      credit_limit: form.value.credit_limit ? Number(form.value.credit_limit) : null,
      balance: form.value.balance ? Number(form.value.balance) : 0,
      min_payment: form.value.min_payment ? Number(form.value.min_payment) : null,
      apr: form.value.apr ? Number(form.value.apr) : null,
      statement_date: form.value.statement_date ? Number(form.value.statement_date) : null,
      due_date: form.value.due_date ? Number(form.value.due_date) : null,
      linked_account_id: form.value.linked_account_id || null
    }

    if (editingCard.value) {
      await cards.updateCard(editingCard.value.id, data)
      toast.success('Card updated')
    } else {
      await cards.createCard(data)
      toast.success('Card added')
    }
    showModal.value = false
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

async function handleDelete(card) {
  if (!confirm(`Delete ${card.name}?`)) return
  try {
    await cards.deleteCard(card.id)
    toast.success('Card deleted')
  } catch (err) {
    toast.error(err.message)
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="headline-md">Cards</h1>
    </div>

    <div v-if="cards.loading && !cards.cards.length" class="skeleton-list">
      <div class="skeleton" style="height: 120px" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="!cards.cardsSortedByUrgency.length" class="empty-state">
      <span class="body-md">No cards yet</span>
      <button class="btn btn-primary" @click="openAdd">Add Your First Card</button>
    </div>

    <div v-else class="cards-list">
      <CardItem
        v-for="card in cards.cardsSortedByUrgency"
        :key="card.id"
        :card="card"
      />
    </div>

    <button class="fab" @click="openAdd">+</button>

    <Modal v-if="showModal" :title="editingCard ? 'Edit Card' : 'Add Card'" @close="showModal = false">
      <form @submit.prevent="handleSave" class="modal-form">
        <div class="input-group">
          <label class="label-sm input-label">Card Name</label>
          <input v-model="form.name" class="input" placeholder="e.g. Chase Sapphire" required />
        </div>
        <div class="input-group">
          <label class="label-sm input-label">Last 4 Digits</label>
          <input v-model="form.last4" class="input" placeholder="1234" maxlength="4" />
        </div>
        <div class="form-row">
          <div class="input-group">
            <label class="label-sm input-label">Credit Limit</label>
            <input v-model="form.credit_limit" class="input" type="number" step="0.01" placeholder="0.00" />
          </div>
          <div class="input-group">
            <label class="label-sm input-label">Balance</label>
            <input v-model="form.balance" class="input" type="number" step="0.01" placeholder="0.00" />
          </div>
        </div>
        <div class="form-row">
          <div class="input-group">
            <label class="label-sm input-label">Min Payment</label>
            <input v-model="form.min_payment" class="input" type="number" step="0.01" placeholder="0.00" />
          </div>
          <div class="input-group">
            <label class="label-sm input-label">APR %</label>
            <input v-model="form.apr" class="input" type="number" step="0.01" placeholder="0.00" />
          </div>
        </div>
        <div class="form-row">
          <div class="input-group">
            <label class="label-sm input-label">Statement Day</label>
            <input v-model="form.statement_date" class="input" type="number" min="1" max="31" placeholder="1-31" />
          </div>
          <div class="input-group">
            <label class="label-sm input-label">Due Day</label>
            <input v-model="form.due_date" class="input" type="number" min="1" max="31" placeholder="1-31" />
          </div>
        </div>
        <div class="input-group">
          <label class="label-sm input-label">Linked Account</label>
          <select v-model="form.linked_account_id" class="input">
            <option value="">None</option>
            <option v-for="acc in accounts.accounts" :key="acc.id" :value="acc.id">
              {{ acc.name }} ({{ acc.type }})
            </option>
          </select>
        </div>
        <div class="modal-actions">
          <button v-if="editingCard" type="button" class="btn btn-danger" @click="handleDelete(editingCard); showModal = false">
            Delete
          </button>
          <button type="submit" class="btn btn-primary btn-full" :disabled="saving">
            {{ saving ? 'Saving...' : editingCard ? 'Update' : 'Add Card' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.cards-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
</style>
