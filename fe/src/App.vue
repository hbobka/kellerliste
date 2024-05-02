<script setup lang="ts">
import { RouterView } from 'vue-router'
import TheAppHeader from '@/components/TheAppHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { onUnmounted } from 'vue'

const { resetAuth } = useAuth()

onUnmounted(() => {
  resetAuth()
})
</script>

<template>
  <TheAppHeader />
  <RouterView class="router-view" />
</template>

<style scoped>
.router-view {
  padding-top: 6rem;
}
</style>
