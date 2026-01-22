// src/main.js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // 1. Impor router

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)
const vuetify = createVuetify({
  components,
  directives,
})
// 3. Gunakan plugin yang Anda butuhkan
app.use(router)
app.use(vuetify)

// 4. Mount aplikasi ke elemen #app di HTML
app.mount('#app')