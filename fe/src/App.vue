<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useInventory } from '@/composables/useInventory'
import TheAppHeader from '@/components/TheAppHeader.vue'

const { getInventory } = useInventory()
onMounted(() => {
  getInventory()
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
