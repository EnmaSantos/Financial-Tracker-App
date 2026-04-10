<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardsStore } from '../stores/cards'
import { useTransactionsStore } from '../stores/transactions'
import { useToast } from '../composables/useToast'
import { supabase, uploadFile } from '../lib/supabase'
import TransactionList from '../components/TransactionList.vue'
import Modal from '../components/Modal.vue'

const route = useRoute()
const router = useRouter()
const cardsStore = useCardsStore()
const txnStore = useTransactionsStore()
const toast = useToast()

const card = computed(() => cardsStore.cardById(route.params.id))
const payments = ref([])
const loadingPayments = ref(false)
const showPayModal = ref(false)
const payAmount = ref('')
const payFile = ref(null)
const payLoading = ref(false)

onMounted(async () => {
  if (!cardsStore.cards.length) await cardsStore.fetchCards()
  fetchPayments()
  txnStore.fetchByCard(route.params.id)

  if (route.query.action === 'confirm-payment') {
    showPayModal.value = true
  }
})

async function fetchPayments() {
  loadingPayments.value = true
  const { data } = await supabase
    .from('payments')
    .select('*')
    .eq('card_id', route.params.id)
    .order('paid_at', { ascending: false })
  payments.value = data || []
  loadingPayments.value = false
}

function onFileChange(e) {
  payFile.value = e.target.files[0] || null
}

async function confirmPayment() {
  if (!payAmount.value) return
  payLoading.value = true

  try {
    let proofUrl = null
    const { data: { user } } = await supabase.auth.getUser()

    if (payFile.value) {
      const ext = payFile.value.name.split('.').pop()
      const path = `${user.id}/${route.params.id}_${Date.now()}.${ext}`
      await uploadFile('payment-proofs', path, payFile.value)
      proofUrl = path
    }

    await supabase.from('payments').insert({
      card_id: route.params.id,
      amount: Number(payAmount.value),
      confirmed: true,
      proof_url: proofUrl,
      user_id: user.id
    })

    await supabase
      .from('reminders')
      .update({ active: false })
      .eq('card_id', route.params.id)

    if (card.value) {
      const newBalance = Math.max(0, Number(card.value.balance) - Number(payAmount.value))
      await cardsStore.updateCard(route.params.id, { balance: newBalance })
    }

    toast.success('Payment confirmed!')
    showPayModal.value = false
    payAmount.value = ''
    payFile.value = null
    fetchPayments()
  } catch (err) {
    toast.error(err.message)
  } finally {
    payLoading.value = false
  }
}

function goBack() {
  router.push('/cards')
}

const formattedBalance = computed(() =>
  Number(card.value?.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
)

const formattedLimit = computed(() =>
  Number(card.value?.credit_limit || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
)
</script>

<template>
  <div class="page" v-if="card">
    <div class="page-header">
      <button class="btn-tertiary" @click="goBack" style="margin-left: -16px; margin-bottom: 8px">
        &larr; Back
      </button>
      <div style="display: flex; justify-content: space-between; align-items: flex-start">
        <div>
          <span class="label-sm" style="color: var(--on-surface-variant)">{{ card.name }}</span>
          <div class="display-lg" style="margin-top: 4px">{{ formattedBalance }}</div>
        </div>
        <span v-if="card.last4" class="label-sm" style="color: var(--on-surface-variant)">**** {{ card.last4 }}</span>
      </div>
    </div>

    <!-- Card Details -->
    <div class="surface-card detail-grid">
      <div>
        <span class="label-sm" style="color: var(--on-surface-variant)">Credit Limit</span>
        <div class="title-md">{{ formattedLimit }}</div>
      </div>
      <div>
        <span class="label-sm" style="color: var(--on-surface-variant)">APR</span>
        <div class="title-md">{{ card.apr ? card.apr + '%' : '--' }}</div>
      </div>
      <div>
        <span class="label-sm" style="color: var(--on-surface-variant)">Min Payment</span>
        <div class="title-md">{{ card.min_payment ? '$' + card.min_payment : '--' }}</div>
      </div>
      <div>
        <span class="label-sm" style="color: var(--on-surface-variant)">Due Date</span>
        <div class="title-md">
          <span class="urgency-dot" :class="card.urgency" style="margin-right: 6px" />
          {{ card.due_date ? `Day ${card.due_date}` : '--' }}
        </div>
      </div>
    </div>

    <!-- Confirm Payment Button -->
    <button class="btn btn-primary btn-full" style="margin-top: 20px" @click="showPayModal = true">
      Confirm Payment
    </button>

    <!-- Payment History -->
    <div class="section-gap">
      <h2 class="headline-md" style="margin-bottom: 16px">Payment History</h2>
      <div v-if="!payments.length" class="empty-state" style="padding: 24px">
        <span class="body-md">No payments recorded</span>
      </div>
      <div v-else class="payments-list">
        <div v-for="p in payments" :key="p.id" class="payment-row">
          <div>
            <span class="body-md">${{ Number(p.amount).toFixed(2) }}</span>
            <span class="label-sm" style="color: var(--on-surface-variant); margin-left: 8px">
              {{ new Date(p.paid_at).toLocaleDateString() }}
            </span>
          </div>
          <span class="badge" :class="p.confirmed ? 'badge-online' : 'badge-offline'">
            {{ p.confirmed ? 'Confirmed' : 'Pending' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Transactions -->
    <div class="section-gap">
      <h2 class="headline-md" style="margin-bottom: 16px">Transactions</h2>
      <TransactionList :transactions="txnStore.transactions" />
    </div>

    <!-- Payment Modal -->
    <Modal v-if="showPayModal" title="Confirm Payment" @close="showPayModal = false">
      <form @submit.prevent="confirmPayment">
        <div class="input-group">
          <label class="label-sm input-label">Amount Paid</label>
          <input
            v-model="payAmount"
            class="input"
            type="number"
            step="0.01"
            :placeholder="card.min_payment ? `Min: $${card.min_payment}` : '0.00'"
            required
          />
        </div>
        <div class="input-group" style="margin-top: 16px">
          <label class="label-sm input-label">Upload Proof (optional)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            class="input"
            @change="onFileChange"
          />
        </div>
        <button type="submit" class="btn btn-primary btn-full" style="margin-top: 20px" :disabled="payLoading">
          {{ payLoading ? 'Processing...' : 'Confirm' }}
        </button>
      </form>
    </Modal>
  </div>

  <div v-else class="page">
    <div class="empty-state">
      <span class="body-md">Card not found</span>
      <button class="btn btn-secondary" @click="goBack">Go Back</button>
    </div>
  </div>
</template>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--surface-low);
  border-radius: var(--radius-md);
}
</style>
