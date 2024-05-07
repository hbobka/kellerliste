<script setup lang="ts">
import TheTiles from '@/components/TheTiles.vue'
import { useInventory } from '@/composables/useInventory'
import { useUI } from '@/composables/useUI'
import { onMounted } from 'vue'

const { getAllInventoryItems } = useInventory()
const { stateUI, setWasInventoryFetched } = useUI()

onMounted(async () => {
  if (!stateUI.value.wasInventoryFetched) {
    await getAllInventoryItems()
    setWasInventoryFetched(true)
  }
})
</script>

<template>
  <main>
    <TheTiles />
  </main>
</template>
