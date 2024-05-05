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

const showNewItem = ref(false)
</script>

<template>
  <main v-if="category">
    <!-- toolbar -->
    <InventoryToolbar
      :category="category"
      :is-in-add-mode="!showNewItem"
      @add-new-item="showNewItem = true"
      @cancel="showNewItem = false"
    />

    <!-- new inventory item -->
    <InventoryItem
      v-if="showNewItem"
      itemId=""
      current-name=""
      current-amount=""
      current-date=""
      :category="category"
      :isNewItem="showNewItem"
      @new-item-created="showNewItem = false"
    />

    <!-- current inventory items -->
    <ul v-if="inventoryItems">
      <li v-for="(item, index) in inventoryItems" :key="index">
        <InventoryItem
          :itemId="item.id"
          :current-name="item.name"
          :current-amount="item.amount"
          :current-date="item.date"
          :category="category"
        />
      </li>
    </ul>
  </main>
</template>
