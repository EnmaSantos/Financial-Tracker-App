import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { useCardsStore } from './cards'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref([])
  const loading = ref(false)
  const error = ref(null)

  const accountsByType = computed(() => {
    const grouped = { checking: [], savings: [], investment: [] }
    for (const a of accounts.value) {
      if (grouped[a.type]) grouped[a.type].push(a)
    }
    return grouped
  })

  const totalByType = computed(() => {
    const totals = {}
    for (const [type, accs] of Object.entries(accountsByType.value)) {
      totals[type] = accs.reduce((sum, a) => sum + Number(a.balance || 0), 0)
    }
    return totals
  })

  const totalAssets = computed(() =>
    accounts.value.reduce((sum, a) => sum + Number(a.balance || 0), 0)
  )

  const netWorth = computed(() => {
    const cardsStore = useCardsStore()
    return totalAssets.value - cardsStore.totalDebt
  })

  async function fetchAccounts() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('accounts')
      .select('*')
      .order('name')
    if (err) {
      error.value = err.message
    } else {
      accounts.value = data
    }
    loading.value = false
  }

  async function createAccount(accountData) {
    const { data, error: err } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single()
    if (err) throw err
    accounts.value.push(data)
    return data
  }

  async function updateAccount(id, accountData) {
    const { data, error: err } = await supabase
      .from('accounts')
      .update(accountData)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const idx = accounts.value.findIndex(a => a.id === id)
    if (idx !== -1) accounts.value[idx] = data
    return data
  }

  async function deleteAccount(id) {
    const { error: err } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
    if (err) throw err
    accounts.value = accounts.value.filter(a => a.id !== id)
  }

  return {
    accounts,
    loading,
    error,
    accountsByType,
    totalByType,
    totalAssets,
    netWorth,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  }
})
