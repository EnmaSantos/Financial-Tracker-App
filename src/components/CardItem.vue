<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  card: { type: Object, required: true }
})

const router = useRouter()

const utilization = computed(() => {
  if (!props.card.credit_limit) return 0
  return Math.min(Number(props.card.balance) / Number(props.card.credit_limit), 1)
})

const utilizationColor = computed(() => {
  const pct = utilization.value
  if (pct > 0.7) return 'var(--error-glow)'
  if (pct > 0.3) return 'var(--warning)'
  return 'var(--primary)'
})

const formattedBalance = computed(() =>
  Number(props.card.balance || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  })
)

const formattedDueDate = computed(() => {
  if (!props.card.nextDueDate) return '--'
  return props.card.nextDueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
})

function navigate() {
  router.push(`/cards/${props.card.id}`)
}
</script>

<template>
  <div class="card-item surface-card" @click="navigate">
    <div class="card-top">
      <div>
        <span class="label-sm" style="color: var(--on-surface-variant)">
          {{ card.name }}
        </span>
        <div class="headline-md" style="margin-top: 4px">
          {{ formattedBalance }}
        </div>
      </div>
      <div class="card-meta">
        <span v-if="card.last4" class="label-sm" style="color: var(--on-surface-variant)">
          **** {{ card.last4 }}
        </span>
      </div>
    </div>

    <div class="utilization-bar" style="margin-top: 16px">
      <div
        class="utilization-bar__fill"
        :style="{ width: (utilization * 100) + '%', background: utilizationColor }"
      />
    </div>

    <div class="card-bottom">
      <div class="due-info">
        <span class="urgency-dot" :class="card.urgency" />
        <span class="body-md">
          Due {{ formattedDueDate }}
        </span>
        <span
          v-if="card.daysUntilDue !== null"
          class="label-sm"
          :class="`urgency-${card.urgency}`"
        >
          {{ card.daysUntilDue <= 0 ? 'Overdue' : `${card.daysUntilDue}d left` }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-item {
  cursor: pointer;
  transition: background 0.2s;
}

.card-item:hover {
  background: var(--surface-highest);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-bottom {
  margin-top: 12px;
}

.due-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
