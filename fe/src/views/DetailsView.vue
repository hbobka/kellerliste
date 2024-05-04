<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useInventory } from '@/composables/useInventory'
import InventoryToolbar from '@/components/InventoryToolbar.vue'
import InventoryItem from '@/components/InventoryItem.vue'
import type { Category } from '@/utils/types'

const route = useRoute()
const { stateInventory } = useInventory()

const category = ref<Category>()
onMounted(() => {
  if (route.query.category) {
    category.value = route.query.category as Category
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
    <!-- toolbar -->
    <InventoryToolbar v-if="category" :category="category" />

    <!-- list -->
    <ul v-if="inventoryItems">
      <li v-for="(item, index) in inventoryItems" :key="index">
        <InventoryItem
          :current-name="item.name"
          :current-amount="item.amount"
          :current-date="item.date"
        />
      </li>
    </ul>
  </main>
</template>
