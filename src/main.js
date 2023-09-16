import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store.js';
import VueCookies from 'vue-cookies';


const app = createApp(App)

// app.provide('$canvas', Array(store.canvas.height).fill().map(() => Array(store.canvas.width).fill(15)))

app.use(router)
app.use(VueCookies, {
    expires: '30d' // 30 days
})

app.mount('#app')
