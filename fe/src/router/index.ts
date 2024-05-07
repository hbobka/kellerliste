import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/details',
      name: 'details',
      component: () => import('../views/DetailsView.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue')
    }
  ]
})

const { stateAuth } = useAuth()
router.beforeEach((to, _, next) => {
  const isLoggedIn = stateAuth.value.isLoggedIn

  if (to.name !== 'auth' && !isLoggedIn) {
    next({ name: 'auth' })
  } else {
    next()
  }
})

export default router
