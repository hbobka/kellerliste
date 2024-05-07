<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { stateAuth, logout } = useAuth()
const router = useRouter()

const goHome = () => {
  router.push({ name: 'home' })
}
const userName = computed(() => stateAuth.value.userName)
const isLoggedIn = computed(() => stateAuth.value.isLoggedIn)
</script>

<template>
  <header>
    <div class="logo-wrapper" @click="goHome">
      <i class="logo-kellerliste"></i>
      <p>kellerliste</p>
    </div>
    <div v-if="isLoggedIn" class="user-wrapper">
      <span>{{ userName }} / <a href="#" @click="logout">logout</a></span>
      <v-icon icon="mdi-account" size="x-large"></v-icon>
    </div>
  </header>
</template>

<style scoped>
header {
  height: 6rem;
  width: 100%;
  background: var(--kl-black);
  color: var(--kl-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  position: fixed;
  z-index: 1000;
}

header * {
  color: var(--kl-white);
}

.logo-wrapper,
.user-wrapper {
  display: flex;
}

.logo-wrapper p {
  font-family: 'Open Sans Condensed', sans-serif;
  font-size: 2rem;
  margin-top: 0.4rem;
}

.user-wrapper {
  margin-top: 1rem;
}
.user-wrapper span {
  margin: 0.25rem 1rem 0 0;
}

.logo-wrapper:hover {
  cursor: pointer;
}

@media (max-width: 768px) {
  .logo-wrapper p {
    display: none;
  }
}
</style>
