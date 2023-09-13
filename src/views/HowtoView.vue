<script setup>
import { store } from '../info.js'
import TitleBar from '../components/TitleBar.vue'
import { RouterLink } from 'vue-router'
import { disable_ctx_menu_all } from '../utils.js'
</script>

<template>
    <TitleBar title="How to pCanvas"/>
    <main>
        <div class="msg-container">
            <img class="icon pixel no-ctx-menu" src="../assets/ui/icons/info.png">
            <div class="content">
                pCanvas is a <a href="https://reddit.com/r/place" target="_blank">r/place</a>-like public drawing canvas. Be a part of its history by:
                <ul>
                    <li>Log into your account, or register if you do not have one.</li>
                    <li>Select a place that you want to draw on.</li>
                    <li>Select your colour, and click Place to draw there.</li>
                    <li>Rinse and repeat!</li>
                </ul>
                If you have any more questions regarding this app, you can contact its admin <a v-bind:href="'mailto:' + store.admin_email">here</a>.
            </div>
        </div>
    </main>
    <footer>
        <RouterLink to="/" class="button">OK</RouterLink>
    </footer>
</template>

<script>
export default {
    mounted() {
        disable_ctx_menu_all();
    }
}
</script>

<style scoped>
footer, main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem 0;
}
</style>