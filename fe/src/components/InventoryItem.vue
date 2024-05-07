<script setup lang="ts">
import { ref, type PropType, watch } from 'vue'
import { useInventory } from '@/composables/useInventory'
import { v4 as uuidv4 } from 'uuid'
import type { Category } from '@/utils/types'

const props = defineProps({
  itemId: {
    type: String,
    required: true
  },
  category: {
    type: String as PropType<Category>,
    required: true
  },
  isNewItem: {
    type: Boolean,
    default: false
  },
  currentName: {
    type: String,
    required: true
  },
  currentAmount: {
    type: String,
    required: true
  },
  currentDate: {
    type: String,
    default: null
  }
})

const emit = defineEmits<{
  itemCreated: []
  itemUpdated: []
}>()

const form = ref()
const isLoading = ref(false)
const name = ref(props.currentName)
const amount = ref(props.currentAmount)
const date = ref(props.currentDate)
const hasChanged = ref(false)

watch([name, amount, date], () => {
  hasChanged.value = true
})

const validatorCount = (value: string) => value.length >= 3 || 'Min 3 characters'
const validatorNumber = (value: string) => !isNaN(parseFloat(value)) || 'Must be a number'
const { createInventoryItem, deleteInventoryItem, updateInventoryItem } = useInventory()

const createItem = async () => {
  if (form.value) {
    const newItem = { id: uuidv4(), name: name.value, amount: amount.value, date: date.value }

    isLoading.value = true
    await createInventoryItem(newItem, props.category)
    isLoading.value = false

    emit('itemCreated')
  }
}

const deleteItem = async (itemId: string) => {
  await deleteInventoryItem(itemId)
}

const updateItem = async (itemId: string) => {
  if (form.value) {
    const updatedItem = { id: itemId, name: name.value, amount: amount.value, date: date.value }

    isLoading.value = true
    await updateInventoryItem(itemId, updatedItem)
    isLoading.value = false

    emit('itemUpdated')
  }
}
</script>

<template>
  <v-form v-model="form" @submit.prevent="createItem">
    <v-container>
      <!-- input fields row-->
      <v-row class="kl-inventory-item-row" align="start">
        <!-- name -->
        <v-col cols="12" md="5">
          <v-text-field
            v-model="name"
            label="Name"
            required
            :rules="[validatorCount]"
          ></v-text-field>
        </v-col>

        <!-- amount -->
        <v-col cols="12" :md="2">
          <v-text-field
            v-model="amount"
            label="Amount"
            type="number"
            min="0"
            required
            :rules="[validatorNumber]"
          ></v-text-field>
        </v-col>

        <!-- date -->
        <v-col cols="12" :md="isNewItem ? 5 : 3">
          <v-text-field v-model="date" label="Best Before Date" type="date"></v-text-field>
        </v-col>

        <!-- edit / delete -->
        <v-col v-if="!isNewItem" cols="12" md="2">
          <v-btn
            class="mb-2"
            color="kl-black"
            density="compact"
            text="Update"
            block
            prepend-icon="mdi-pencil"
            :disabled="!hasChanged"
            @click="updateItem(props.itemId)"
          />
          <v-btn
            color="kl-black"
            density="compact"
            text="Delete"
            block
            prepend-icon="mdi-delete"
            @click="deleteItem(props.itemId)"
          />
        </v-col>

        <!-- delete -->
      </v-row>

      <!-- send button -->
      <v-row v-if="isNewItem">
        <v-col cols="12">
          <v-btn
            :disabled="!form"
            :loading="isLoading"
            type="submit"
            text="Send"
            color="kl-success"
            prepend-icon="mdi-send"
            block
          />
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
