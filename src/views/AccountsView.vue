<script setup>
import { ref, onMounted } from 'vue'
import { useAccountsStore } from '../stores/accounts'
import { useCardsStore } from '../stores/cards'
import { useToast } from '../composables/useToast'
import AccountItem from '../components/AccountItem.vue'
import Modal from '../components/Modal.vue'

const accounts = useAccountsStore()
const cards = useCardsStore()
const toast = useToast()

const showModal = ref(false)
const editingAccount = ref(null)
const saving = ref(false)

const form = ref({
  name: '',
  type: 'checking',
  institution: '',
  balance: ''
})

onMounted(() => {
  accounts.fetchAccounts()
  if (!cards.cards.length) cards.fetchCards()
})

function openAdd() {
  editingAccount.value = null
  form.value = { name: '', type: 'checking', institution: '', balance: '' }
  showModal.value = true
}

function openEdit(account) {
  editingAccount.value = account
  form.value = {
    name: account.name || '',
    type: account.type || 'checking',
    institution: account.institution || '',
    balance: account.balance ?? ''
  }
  showModal.value = true
}

async function handleSave() {
  saving.value = true
  try {
    const data = {
      name: form.value.name,
      type: form.value.type,
      institution: form.value.institution || null,
      balance: form.value.balance ? Number(form.value.balance) : 0
    }
    if (editingAccount.value) {
      await accounts.updateAccount(editingAccount.value.id, data)
      toast.success('Account updated')
    } else {
      await accounts.createAccount(data)
      toast.success('Account added')
    }
    showModal.value = false
  } catch (err) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

async function handleDelete(account) {
  if (!confirm(`Delete ${account.name}?`)) return
  try {
    await accounts.deleteAccount(account.id)
    toast.success('Account deleted')
  } catch (err) {
    toast.error(err.message)
  }
}

function formatCurrency(n) {
  return Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

const typeLabels = { checking: 'Checking', savings: 'Savings', investment: 'Investment' }
const types = ['checking', 'savings', 'investment']
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1 class="headline-md">Accounts</h1>
      <div class="surface-card" style="margin-top: 16px">
        <span class="label-sm" style="color: var(--on-surface-variant)">Net Worth</span>
        <div class="headline-md" style="margin-top: 4px" :style="{ color: accounts.netWorth >= 0 ? 'var(--primary)' : 'var(--error-glow)' }">
          {{ formatCurrency(accounts.netWorth) }}
        </div>
      </div>
    </div>

    <div v-if="accounts.loading && !accounts.accounts.length" class="skeleton-list">
      <div class="skeleton" style="height: 80px" v-for="i in 3" :key="i" />
    </div>

    <template v-else>
      <div v-for="type in types" :key="type" class="section-gap">
        <template v-if="accounts.accountsByType[type]?.length">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px">
            <h2 class="title-md">{{ typeLabels[type] }}</h2>
            <span class="label-sm" style="color: var(--primary)">{{ formatCurrency(accounts.totalByType[type]) }}</span>
          </div>
          <div class="accounts-list">
            <AccountItem
              v-for="acc in accounts.accountsByType[type]"
              :key="acc.id"
              :account="acc"
              @edit="openEdit"
              @delete="handleDelete"
            />
          </div>
        </template>
      </div>

      <div v-if="!accounts.accounts.length" class="empty-state">
        <span class="body-md">No accounts yet</span>
        <button class="btn btn-primary" @click="openAdd">Add Your First Account</button>
      </div>
    </template>

    <button class="fab" @click="openAdd">+</button>

    <Modal v-if="showModal" :title="editingAccount ? 'Edit Account' : 'Add Account'" @close="showModal = false">
      <form @submit.prevent="handleSave" class="modal-form">
        <div class="input-group">
          <label class="label-sm input-label">Account Name</label>
          <input v-model="form.name" class="input" placeholder="e.g. Main Checking" required />
        </div>
        <div class="input-group">
          <label class="label-sm input-label">Type</label>
          <select v-model="form.type" class="input">
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="investment">Investment</option>
          </select>
        </div>
        <div class="input-group">
          <label class="label-sm input-label">Institution</label>
          <input v-model="form.institution" class="input" placeholder="e.g. Chase" />
        </div>
        <div class="input-group">
          <label class="label-sm input-label">Balance</label>
          <input v-model="form.balance" class="input" type="number" step="0.01" placeholder="0.00" />
        </div>
        <button type="submit" class="btn btn-primary btn-full" :disabled="saving" style="margin-top: 8px">
          {{ saving ? 'Saving...' : editingAccount ? 'Update' : 'Add Account' }}
        </button>
      </form>
    </Modal>
  </div>
</template>

<style scoped>
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
</style>
