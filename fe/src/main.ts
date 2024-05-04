import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { vuetify } from '@/utils/theme'
import { useAuth } from '@/composables/useAuth'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import '@/assets/css/main.css'

// init auth
useAuth().initAuth()
useAuth().resetAuthOnWindowReload()


// create app
const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')
