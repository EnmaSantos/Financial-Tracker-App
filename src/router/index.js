import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../views/AuthView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cards',
    name: 'cards',
    component: () => import('../views/CardsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cards/:id',
    name: 'card-detail',
    component: () => import('../views/CardDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('../views/AccountsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/statements',
    name: 'statements',
    component: () => import('../views/StatementsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reminders',
    name: 'reminders',
    component: () => import('../views/RemindersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.loading) {
    await new Promise(resolve => {
      const unwatch = auth.$subscribe(() => {
        if (!auth.loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'auth' }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
