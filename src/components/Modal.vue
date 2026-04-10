<script setup>
defineProps({
  title: { type: String, default: '' }
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="modal-overlay" @click.self="emit('close')">
        <Transition name="slide-up" appear>
          <div class="modal-panel glass">
            <div class="modal-header" v-if="title">
              <h2 class="title-md">{{ title }}</h2>
              <button class="modal-close" @click="emit('close')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 13, 26, 0.8);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  padding: 20px;
  padding-bottom: calc(var(--safe-bottom) + 20px);
}

.modal-panel {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-lg) var(--radius-lg);
  padding: 24px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-close {
  color: var(--on-surface-variant);
  padding: 4px;
  transition: color 0.2s;
}

.modal-close:hover {
  color: var(--on-surface);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
