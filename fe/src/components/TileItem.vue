<script setup lang="ts">
import { computed } from 'vue'
import { type PropType } from 'vue'
import { useRouter } from 'vue-router'

type TileStatus = 'success' | 'warning' | 'error' | 'new'
const props = defineProps({
  icon: String,
  text: String,
  status: String as PropType<TileStatus>
})

const textStyle = computed(() =>
  props.status === 'success' || props.status === 'error' || props.status === 'new'
    ? 'color: var(--kl-white)'
    : 'color: var(--kl-black)'
)

const iconStyle = computed(() =>
  props.status === 'success' || props.status === 'error' || props.status === 'new'
    ? 'background: var(--kl-white)'
    : 'background: var(--kl-black)'
)

const tileStyle = computed(() => (props.status !== 'new' ? props.status : 'dark'))

const router = useRouter()
const openDetails = () => {
  router.push('details')
}
</script>

<template>
  <div class="tile-item__wrapper" :class="tileStyle" @click="openDetails">
    <i :class="props.icon" :style="iconStyle"></i>
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

.tile-item__wrapper p {
  margin-top: 0.5rem;
  font-size: 1.5rem;
}
</style>
