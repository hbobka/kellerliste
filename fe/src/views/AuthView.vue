<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import router from '@/router'

const route = useRoute()
const { setAuthCode, getAuthTokens, getUserInfo } = useAuth()
const isLoading = ref(false)

onMounted(async () => {
  const authCode = route.query?.code?.toString()
  if (authCode) {
    setAuthCode(authCode)
    isLoading.value = true
    const tokens = await getAuthTokens(authCode)

    if (tokens?.accessToken) {
      await getUserInfo(tokens?.accessToken)
      isLoading.value = false
      router.push({ name: 'home' })
    }
  }
})
</script>

<template>
  <main>
    <div class="kl-progress" v-if="isLoading">
      <v-progress-circular
        :size="100"
        :width="8"
        color="kl-black"
        indeterminate
      ></v-progress-circular>
      <p>Authentication in progress</p>
    </div>
  </main>
</template>

<style scoped>
main {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -40%);
}

.kl-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.kl-progress p {
  margin-top: 1rem;
}
</style>
