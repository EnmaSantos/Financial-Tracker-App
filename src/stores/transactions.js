import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchByCard(cardId) {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('transactions')
      .select('*')
      .eq('card_id', cardId)
      .order('date', { ascending: false })
    if (err) {
      error.value = err.message
    } else {
      transactions.value = data
    }
    loading.value = false
  }

  async function saveTransactions(cardId, txns) {
    const rows = txns.map(t => ({
      card_id: cardId,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      statement_id: t.statement_id || null
    }))

    const { data, error: err } = await supabase
      .from('transactions')
      .insert(rows)
      .select()

    if (err) throw err
    transactions.value = [...data, ...transactions.value]
    return data
  }

  async function deleteTransaction(id) {
    const { error: err } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    if (err) throw err
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  async function updateTransaction(id, data) {
    const { data: updated, error: err } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) transactions.value[idx] = updated
    return updated
  }

  return {
    transactions,
    loading,
    error,
    fetchByCard,
    saveTransactions,
    deleteTransaction,
    updateTransaction
  }
})
