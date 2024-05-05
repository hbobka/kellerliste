<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { useInventory } from '@/composables/useInventory'
import type { Category } from '@/utils/types'

const props = defineProps({
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
  newItemCreated: []
}>()

const form = ref()
const isLoading = ref(false)
const name = ref(props.currentName)
const amount = ref(props.currentAmount)
const date = ref(props.currentDate)

const validatorCount = (value: string) => value.length >= 3 || 'Min 3 characters'
const validatorNumber = (value: string) => !isNaN(parseFloat(value)) || 'Must be a number'
const { createInventoryItem } = useInventory()

const submit = async () => {
  if (form.value && props.category) {
    const newItem = { name: name.value, amount: amount.value, date: date.value }

    isLoading.value = true
    await createInventoryItem(newItem, props.category)
    isLoading.value = false

    emit('newItemCreated')
  }
}
</script>

<template>
  <v-form v-model="form" @submit.prevent="submit">
    <v-container>
      <!-- input fields row-->
      <v-row>
        <!-- name -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="name"
            label="Name"
            required
            :rules="[validatorCount]"
          ></v-text-field>
        </v-col>

        <!-- amount -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="amount"
            label="Amount"
            suffix="l"
            type="number"
            min="0"
            required
            :rules="[validatorNumber]"
          ></v-text-field>
        </v-col>

        <!-- date -->
        <v-col cols="12" md="4">
          <v-text-field v-model="date" label="Best Before Date" type="date"></v-text-field>
        </v-col>
      </v-row>

      <!-- action buttons row-->
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
