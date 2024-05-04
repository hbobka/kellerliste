<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
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

const name = ref(props.currentName)
const amount = ref(props.currentAmount)
const date = ref(props.currentDate)
</script>

<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field v-model="name" label="Name" hide-details required></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="amount" label="Amount" hide-details required></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field v-model="date" label="Date" hide-details required></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
