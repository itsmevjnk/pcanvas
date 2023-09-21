import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store.js';
import VueCookies from 'vue-cookies';
import { disable_ctx_menu } from './utils.js';

const app = createApp(App)

// app.provide('$canvas', Array(store.canvas.height).fill().map(() => Array(store.canvas.width).fill(15)))

app.use(router)
app.use(VueCookies, {
    expires: '30d' // 30 days
})

app.directive('no-ctx-menu', {
    mounted: (e) => disable_ctx_menu(e)
});

app.directive('focus', {
    mounted: (e) => e.focus()
});

app.mount('#app')

