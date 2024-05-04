<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useRouter } from 'vue-router'
import { useInventory } from '@/composables/useInventory'
import type { Category } from '@/utils/types'

const props = defineProps({
  category: {
    type: String as PropType<Category>,
    required: true
  }
})

const emit = defineEmits<{
  addRow: []
  cancel: []
}>()

const router = useRouter()
const { createInventoryItem } = useInventory()

const showAddButton = ref(true)
const showCancelButton = ref(false)
const showSendButton = ref(false)
const start = async () => {
  emit('addRow')
  showAddButton.value = false
  showCancelButton.value = true
  showSendButton.value = true
  // 2. capture user inputs + assemble item
  // 3. send button
  // if (item && props.category) {
  //   await createInventoryItem(item, props.category)
  // }
}

const cancel = () => {
  emit('cancel')
  showAddButton.value = true
  showCancelButton.value = false
  showSendButton.value = false
}

const send = () => {
  emit('cancel')
  showAddButton.value = true
  showCancelButton.value = false
  showSendButton.value = false
}
// const testItem = { name: 'test', amount: '1', date: Date.now().toString() }
</script>

<template>
  <v-container>
    <div class="d-flex justify-space-between align-center">
      <v-btn
        text="Back"
        color="kl-white"
        prepend-icon="mdi-arrow-left"
        :disabled="showSendButton"
        @click="router.push({ name: 'home' })"
      />
      <h1>{{ props.category?.toUpperCase() }}</h1>
      <div>
        <v-btn
          v-if="showAddButton"
          text="Add"
          color="kl-black"
          prepend-icon="mdi-plus"
          @click="start()"
        />
        <v-btn
          v-if="showSendButton"
          text="Send"
          color="kl-success"
          prepend-icon="mdi-send"
          @click="send()"
        />
        <v-btn
          v-if="showCancelButton"
          text="Cancel"
          color="kl-error"
          prepend-icon="mdi-close"
          @click="cancel()"
        />
      </div>
    </div>
  </v-container>
</template>
