import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useCardsStore = defineStore('cards', () => {
  const cards = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalDebt = computed(() =>
    cards.value.reduce((sum, c) => sum + Number(c.balance || 0), 0)
  )

  const totalCreditLimit = computed(() =>
    cards.value.reduce((sum, c) => sum + Number(c.credit_limit || 0), 0)
  )

  const creditUtilization = computed(() =>
    totalCreditLimit.value > 0
      ? totalDebt.value / totalCreditLimit.value
      : 0
  )

  function getNextDueDate(dayOfMonth) {
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), dayOfMonth)
    if (thisMonth >= today) return thisMonth
    return new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth)
  }

  function getDaysUntilDue(dayOfMonth) {
    const nextDue = getNextDueDate(dayOfMonth)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24))
  }

  function getUrgency(dayOfMonth) {
    const days = getDaysUntilDue(dayOfMonth)
    if (days <= 0) return 'danger'
    if (days <= 3) return 'danger'
    if (days <= 7) return 'warning'
    return 'safe'
  }

  const cardsWithUrgency = computed(() =>
    cards.value.map(card => ({
      ...card,
      nextDueDate: card.due_date ? getNextDueDate(card.due_date) : null,
      daysUntilDue: card.due_date ? getDaysUntilDue(card.due_date) : null,
      urgency: card.due_date ? getUrgency(card.due_date) : 'safe'
    }))
  )

  const upcomingDueDates = computed(() =>
    [...cardsWithUrgency.value]
      .filter(c => c.nextDueDate)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 3)
  )

  const cardsSortedByUrgency = computed(() =>
    [...cardsWithUrgency.value].sort((a, b) => (a.daysUntilDue ?? 999) - (b.daysUntilDue ?? 999))
  )

  function cardById(id) {
    return cardsWithUrgency.value.find(c => c.id === id) || null
  }

  async function fetchCards() {
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('cards')
      .select('*')
      .order('due_date')
    if (err) {
      error.value = err.message
    } else {
      cards.value = data
    }
    loading.value = false
  }

  async function createCard(cardData) {
    const { data, error: err } = await supabase
      .from('cards')
      .insert(cardData)
      .select()
      .single()
    if (err) throw err
    cards.value.push(data)
    return data
  }

  async function updateCard(id, cardData) {
    const { data, error: err } = await supabase
      .from('cards')
      .update(cardData)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const idx = cards.value.findIndex(c => c.id === id)
    if (idx !== -1) cards.value[idx] = data
    return data
  }

  async function deleteCard(id) {
    const { error: err } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
    if (err) throw err
    cards.value = cards.value.filter(c => c.id !== id)
  }

  return {
    cards,
    loading,
    error,
    totalDebt,
    totalCreditLimit,
    creditUtilization,
    cardsWithUrgency,
    upcomingDueDates,
    cardsSortedByUrgency,
    cardById,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    getDaysUntilDue,
    getUrgency,
    getNextDueDate
  }
})
