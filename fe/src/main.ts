import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuth } from '@/composables/useAuth'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { klTheme } from '@/utils/theme'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import 'vuetify/styles'
import '@/assets/css/main.css'

// create vuetify ui components
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi'
  },
  theme: {
    defaultTheme: 'klTheme',
    themes: {
      klTheme
    }
  }
})

// create app
const app = createApp(App)
app.use(router)
app.use(vuetify)
app.mount('#app')

// init auth
useAuth().initAuth()
useAuth().resetAuthOnWindowReload()
