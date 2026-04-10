<script setup>
import { computed } from 'vue'

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  editable: { type: Boolean, default: false }
})

const emit = defineEmits(['edit', 'delete'])

function formatAmount(amount) {
  const num = Number(amount)
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'auto'
  })
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const typeColors = {
  purchase: 'var(--on-surface)',
  payment: 'var(--primary)',
  fee: 'var(--warning)',
  interest: 'var(--error-glow)',
  refund: 'var(--primary-glow)'
}
</script>

<template>
  <div class="txn-list" v-if="transactions.length">
    <div
      v-for="(txn, i) in transactions"
      :key="txn.id || i"
      class="txn-row"
      :class="{ 'txn-alt': i % 2 === 1 }"
    >
      <div class="txn-left">
        <span class="body-md">{{ txn.description || 'Untitled' }}</span>
        <span class="label-sm" style="color: var(--on-surface-variant)">
          {{ formatDate(txn.date) }}
          <span v-if="txn.type" class="txn-type" :style="{ color: typeColors[txn.type] }">
            {{ txn.type }}
          </span>
        </span>
      </div>
      <div class="txn-right">
        <span
          class="title-md"
          :style="{ color: Number(txn.amount) < 0 ? 'var(--primary)' : 'var(--on-surface)' }"
        >
          {{ formatAmount(txn.amount) }}
        </span>
        <div v-if="editable" class="txn-actions">
          <button class="btn-sm" @click="emit('edit', txn, i)">Edit</button>
          <button class="btn-sm" style="color: var(--error-glow)" @click="emit('delete', txn, i)">Del</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-state">
    <span class="body-md">No transactions</span>
  </div>
</template>

<style scoped>
.txn-list {
  display: flex;
  flex-direction: column;
}

.txn-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-md);
}

.txn-alt {
  background: var(--surface-low);
}

.txn-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.txn-type {
  margin-left: 8px;
  text-transform: capitalize;
}

.txn-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.txn-actions {
  display: flex;
  gap: 4px;
}

.btn-sm {
  font-size: 0.6875rem;
  padding: 2px 6px;
  cursor: pointer;
  background: none;
  color: var(--on-surface-variant);
}
</style>
