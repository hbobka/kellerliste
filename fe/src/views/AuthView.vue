<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import router from '@/router'

const route = useRoute()
const { setAuthCode, getAuthTokens, getUserInfo } = useAuth()

onMounted(async () => {
  const authCode = route.query?.code?.toString()
  if (authCode) {
    setAuthCode(authCode)
    const tokens = await getAuthTokens(authCode)

    if (tokens?.accessToken) {
      await getUserInfo(tokens?.accessToken)
      router.push({ name: 'home' })
    }
  }
})
</script>

<template>
  <main>
    <h2>Processing Login ...</h2>
  </main>
</template>

<style scoped>
main {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -30%);
  width: 20rem;
  margin: 0 auto;
}

h2 {
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
}
</style>
