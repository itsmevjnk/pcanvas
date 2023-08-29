import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './info.js';


const app = createApp(App)

// app.provide('$canvas', Array(store.canvas.height).fill().map(() => Array(store.canvas.width).fill(15)))

app.use(router)

app.mount('#app')
