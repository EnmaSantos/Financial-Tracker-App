<script setup>
import { computed } from 'vue'

const props = defineProps({
  account: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'delete'])

const formattedBalance = computed(() =>
  Number(props.account.balance || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
)

const typeLabel = computed(() => {
  const labels = { checking: 'Checking', savings: 'Savings', investment: 'Investment' }
  return labels[props.account.type] || props.account.type
})
</script>

<template>
  <div class="account-item">
    <div class="account-left">
      <div class="title-md">{{ account.name }}</div>
      <div class="account-meta">
        <span class="label-sm badge-type">{{ typeLabel }}</span>
        <span v-if="account.institution" class="body-md" style="color: var(--on-surface-variant)">
          {{ account.institution }}
        </span>
      </div>
    </div>
    <div class="account-right">
      <div class="headline-md">{{ formattedBalance }}</div>
      <div class="account-actions">
        <button class="btn-tertiary btn-sm" @click.stop="emit('edit', account)">Edit</button>
        <button class="btn-sm" style="color: var(--error-glow)" @click.stop="emit('delete', account)">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--surface-mid);
  border-radius: var(--radius-lg);
  transition: background 0.2s;
}

.account-item:hover {
  background: var(--surface-high);
}

.account-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.badge-type {
  padding: 2px 8px;
  background: var(--surface-highest);
  border-radius: 999px;
  color: var(--on-surface-variant);
}

.account-right {
  text-align: right;
}

.account-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
}

.btn-sm {
  font-size: 0.75rem;
  padding: 4px 8px;
  cursor: pointer;
  background: none;
}
</style>
