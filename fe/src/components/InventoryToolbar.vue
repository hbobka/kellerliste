<script setup lang="ts">
import { type PropType } from 'vue'
import { useRouter } from 'vue-router'
import type { Category } from '@/utils/types'

const props = defineProps({
  category: {
    type: String as PropType<Category>,
    required: true
  },
  isInAddMode: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits<{
  cancel: []
  addNewItem: []
}>()

const router = useRouter()
</script>

<template>
  <v-container>
    <div class="d-flex justify-space-between align-center">
      <!-- back -->
      <v-btn
        text="Back"
        color="kl-white"
        prepend-icon="mdi-arrow-left"
        :disabled="!isInAddMode"
        @click="router.push({ name: 'home' })"
      />

      <!-- title -->
      <h1 class="kl-category-title">{{ props.category?.toUpperCase() }}</h1>

      <!-- add -->
      <v-btn
        v-if="isInAddMode"
        text="Create"
        color="kl-black"
        prepend-icon="mdi-plus"
        @click="emit('addNewItem')"
      />
      <!-- cancel -->
      <v-btn
        v-if="!isInAddMode"
        text="Cancel"
        color="kl-error"
        prepend-icon="mdi-close"
        @click="emit('cancel')"
      />
    </div>
  </v-container>
</template>

<style scoped>
.kl-category-title {
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 1rem;
}
</style>
