<script setup lang="ts">
import TheTiles from '@/components/TheTiles.vue'
import { useInventory } from '@/composables/useInventory'
import { useUI } from '@/composables/useUI'
import { onMounted } from 'vue'

const { getInventory } = useInventory()
const { stateUI } = useUI()

onMounted(async () => {
  if (!stateUI.value.wasInventoryFetched) {
    await getInventory()
  }
})
</script>

<template>
  <main>
    <TheTiles />
  </main>
</template>
