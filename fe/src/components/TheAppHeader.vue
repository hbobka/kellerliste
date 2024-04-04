<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => {
  router.push({ name: 'home' })
}
</script>

<template>
  <header>
    <div class="logo-wrapper" @click="goHome">
      <i class="logo-kellerliste"></i>
      <p>kellerliste</p>
    </div>
    <i class="fa-user"></i>
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

.logo-wrapper {
  display: flex;
}

.logo-wrapper p {
  font-family: 'Open Sans Condensed', sans-serif;
  font-size: 2rem;
  margin-top: 0.4rem;
}

.logo-wrapper:hover {
  cursor: pointer;
}
</style>
