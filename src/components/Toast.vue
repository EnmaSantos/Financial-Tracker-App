<script setup>
import { useToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="slide-up">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: calc(var(--safe-top) + 16px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: calc(100% - 40px);
  max-width: 400px;
  pointer-events: none;
}

.toast {
  padding: 14px 20px;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  pointer-events: auto;
}

.toast-success {
  background: rgba(76, 223, 157, 0.15);
  color: var(--primary);
}

.toast-error {
  background: rgba(255, 107, 107, 0.15);
  color: var(--error-glow);
}

.toast-info {
  background: var(--surface-high);
  color: var(--on-surface);
}
</style>
