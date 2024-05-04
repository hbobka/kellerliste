<script setup lang="ts">
import { type PropType } from 'vue'
import { useRouter } from 'vue-router'
import { useInventory } from '@/composables/useInventory'
import type { Category } from '@/utils/types'

const props = defineProps({
  category: {
    type: String as PropType<Category>,
    required: true
  }
})

const router = useRouter()
const { createInventoryItem } = useInventory()
const testItem = { name: 'test', amount: '1', date: Date.now().toString() }
</script>

<template>
  <v-container>
    <div class="d-flex justify-space-between align-center">
      <v-btn
        text="Back"
        color="kl-black"
        prepend-icon="mdi-arrow-left"
        @click="router.push({ name: 'home' })"
      />
      <h1>{{ props.category?.toUpperCase() }}</h1>
      <v-btn
        text="Add"
        color="kl-success"
        prepend-icon="mdi-plus"
        @click="props.category && createInventoryItem(testItem, props.category)"
      />
    </div>
  </v-container>
</template>
