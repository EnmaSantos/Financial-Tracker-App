<script setup>
import { onMounted, computed } from 'vue'
import { useCardsStore } from '../stores/cards'
import { useAccountsStore } from '../stores/accounts'
import { useAuthStore } from '../stores/auth'
import CardItem from '../components/CardItem.vue'

const cards = useCardsStore()
const accounts = useAccountsStore()
const auth = useAuthStore()

onMounted(() => {
  cards.fetchCards()
  accounts.fetchAccounts()
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const formattedDebt = computed(() =>
  cards.totalDebt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
)

const formattedAssets = computed(() =>
  accounts.totalAssets.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
)

const formattedNetWorth = computed(() =>
  accounts.netWorth.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
)

const utilizationPct = computed(() => Math.round(cards.creditUtilization * 100))

const utilizationColor = computed(() => {
  const pct = cards.creditUtilization
  if (pct > 0.7) return 'var(--error-glow)'
  if (pct > 0.3) return 'var(--warning)'
  return 'var(--primary)'
})

const todayFormatted = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <span class="label-sm" style="color: var(--on-surface-variant)">{{ todayFormatted }}</span>
      <h1 class="headline-md" style="margin-top: 4px">
        {{ greeting }}
      </h1>
    </div>

    <!-- Total Debt -->
    <div class="surface-card">
      <span class="label-sm" style="color: var(--on-surface-variant)">Total Debt</span>
      <div class="display-lg" style="margin-top: 8px">{{ formattedDebt }}</div>

      <div style="margin-top: 16px">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px">
          <span class="label-sm" style="color: var(--on-surface-variant)">Credit Utilization</span>
          <span class="label-sm" :style="{ color: utilizationColor }">{{ utilizationPct }}%</span>
        </div>
        <div class="utilization-bar">
          <div
            class="utilization-bar__fill"
            :style="{ width: utilizationPct + '%', background: utilizationColor }"
          />
        </div>
      </div>

      <!-- Skeleton loading -->
      <template v-if="cards.loading">
        <div class="skeleton" style="height: 56px; margin-top: 16px" />
      </template>
    </div>

    <!-- Upcoming Due Dates -->
    <div class="section-gap" v-if="cards.upcomingDueDates.length">
      <h2 class="headline-md" style="margin-bottom: 16px">Upcoming</h2>
      <div class="due-cards">
        <CardItem
          v-for="card in cards.upcomingDueDates"
          :key="card.id"
          :card="card"
        />
      </div>
    </div>

    <!-- Net Worth -->
    <div class="section-gap">
      <h2 class="headline-md" style="margin-bottom: 16px">Net Worth</h2>
      <div class="surface-card">
        <div class="net-worth-grid">
          <div>
            <span class="label-sm" style="color: var(--on-surface-variant)">Assets</span>
            <div class="title-md" style="color: var(--primary); margin-top: 4px">{{ formattedAssets }}</div>
          </div>
          <div>
            <span class="label-sm" style="color: var(--on-surface-variant)">Liabilities</span>
            <div class="title-md" style="color: var(--error-glow); margin-top: 4px">{{ formattedDebt }}</div>
          </div>
        </div>
        <div style="margin-top: 16px; padding-top: 16px; background: var(--surface-mid); margin: 16px -20px -20px; padding: 16px 20px; border-radius: 0 0 var(--radius-xl) var(--radius-xl)">
          <span class="label-sm" style="color: var(--on-surface-variant)">Net Worth</span>
          <div class="headline-md" style="margin-top: 4px" :style="{ color: accounts.netWorth >= 0 ? 'var(--primary)' : 'var(--error-glow)' }">
            {{ formattedNetWorth }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.due-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.net-worth-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
</style>
