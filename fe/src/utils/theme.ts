import { type ThemeDefinition } from 'vuetify'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const klTheme: ThemeDefinition = {
  dark: false,
  colors: {
    'kl-black': '#343a40',
    'kl-white': '#ffffff',
    'kl-success': '#28a745',
    'kl-warning': '#ffc707',
    'kl-error': '#dc3545',
    info: '#2196F3',
    error: '#B00020',
    warning: '#FB8C00',
    success: '#4CAF50'
  }
}

export const vuetify = createVuetify({
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
