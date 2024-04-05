<script setup lang="ts">
import type { TileCategory } from '@/components/TileItem.vue'
import { useInventory } from '@/composables/useInventory'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { stateInventory } = useInventory()

const category = ref<TileCategory | null>(null)
onMounted(() => {
  if (route.query.category) {
    category.value = route.query.category as TileCategory
  }
})

const inventoryItems = computed(() => {
  return category.value && stateInventory.value
    ? stateInventory.value[category.value as keyof typeof stateInventory.value]
    : []
})
</script>

<template>
  <main>
    <h1>This is The Details View</h1>
    <ul v-if="inventoryItems">
      <li v-for="(item, index) in inventoryItems" :key="index">{{ item }}</li>
    </ul>
  </main>
</template>
