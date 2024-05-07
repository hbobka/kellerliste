<script setup lang="ts">
import { useDate } from 'vuetify'

const date = useDate()
const formattedDate = date.format(Date.now(), 'fullDateTime')
</script>
<template>
  <footer>
    <p>{{ formattedDate }}</p>
  </footer>
</template>

<style scoped>
footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 1rem;
}

footer p {
  text-align: center;
}
</style>
