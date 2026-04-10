<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const mode = ref('signin')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  loading.value = true
  errorMsg.value = ''

  try {
    if (mode.value === 'signin') {
      await auth.signInWithEmail(email.value, password.value)
      router.push('/')
    } else if (mode.value === 'signup') {
      await auth.signUp(email.value, password.value)
      toast.success('Check your email to confirm your account')
    } else {
      await auth.signInWithMagicLink(email.value)
      toast.success('Magic link sent! Check your email')
    }
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="display-lg" style="color: var(--primary)">CardWise</h1>
        <p class="body-md" style="color: var(--on-surface-variant); margin-top: 8px">
          Your financial curator
        </p>
      </div>

      <div class="auth-tabs">
        <button
          v-for="tab in [
            { key: 'signin', label: 'Sign In' },
            { key: 'signup', label: 'Sign Up' },
            { key: 'magic', label: 'Magic Link' }
          ]"
          :key="tab.key"
          class="auth-tab"
          :class="{ active: mode === tab.key }"
          @click="mode = tab.key; errorMsg = ''"
        >
          {{ tab.label }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="input-group">
          <label class="label-sm input-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="input"
            placeholder="you@example.com"
            required
          />
        </div>

        <div v-if="mode !== 'magic'" class="input-group">
          <label class="label-sm input-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="input"
            placeholder="Enter your password"
            required
          />
        </div>

        <div v-if="errorMsg" class="auth-error">
          {{ errorMsg }}
        </div>

        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-tabs {
  display: flex;
  gap: 4px;
  background: var(--surface-low);
  border-radius: var(--radius-lg);
  padding: 4px;
  margin-bottom: 24px;
}

.auth-tab {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--on-surface-variant);
  transition: all 0.2s;
  cursor: pointer;
  background: none;
}

.auth-tab.active {
  background: var(--surface-high);
  color: var(--on-surface);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-error {
  padding: 12px 16px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: var(--radius-md);
  color: var(--error-glow);
  font-size: 0.8125rem;
}
</style>
