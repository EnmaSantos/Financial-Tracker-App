import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  function addToast(message, type = 'info', duration = 3000) {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(message, duration) {
    addToast(message, 'success', duration)
  }

  function error(message, duration) {
    addToast(message, 'error', duration)
  }

  function info(message, duration) {
    addToast(message, 'info', duration)
  }

  return { toasts, addToast, success, error, info }
}
