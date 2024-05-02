<script setup lang="ts">
import TheTiles from '@/components/TheTiles.vue'
import { useInventory } from '@/composables/useInventory'
import { onMounted } from 'vue'

const { getInventory } = useInventory()
onMounted(() => {
  // TODO: call only once
  getInventory()
})
</script>

<template>
  <main>
    <TheTiles />
  </main>
</template>
