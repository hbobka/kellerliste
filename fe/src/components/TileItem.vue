<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'
import { useRouter } from 'vue-router'
import type { Category, Status } from '@/utils/types'

const props = defineProps({
  icon: String,
  text: String,
  category: String as PropType<Category>,
  status: String as PropType<Status>
})

const textStyle = computed(() =>
  props.status === 'success' || props.status === 'error' || props.status === 'new'
    ? 'color: var(--kl-white)'
    : 'color: var(--kl-black)'
)
const iconColor = computed(() =>
  props.status === 'success' || props.status === 'error' || props.status === 'new'
    ? 'var(--kl-white)'
    : 'var(--kl-black)'
)
const tileStyle = computed(() => (props.status !== 'new' ? props.status : 'dark'))

const router = useRouter()
const openDetails = () => {
  router.push({ name: 'details', query: { category: props.category } })
}
</script>

<template>
  <div class="tile-item__wrapper" :class="tileStyle" @click="openDetails">
    <v-icon class="icon" :icon="props.icon" :color="iconColor"></v-icon>
    <p :style="textStyle">{{ props.text }}</p>
  </div>
</template>

<style scoped>
.tile-item__wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: var(--kl-tile-size);
  height: var(--kl-tile-size);
  border: 1px solid var(--kl-black);
}

.tile-item__wrapper:hover {
  opacity: 0.9;
  cursor: pointer;
}

.icon {
  font-size: 8rem;
}

.tile-item__wrapper p {
  margin-top: 0.5rem;
  font-size: 1.5rem;
}
</style>
