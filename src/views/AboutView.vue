<script setup>
import TitleBar from '../components/TitleBar.vue'
import { RouterLink } from 'vue-router'
import { disable_ctx_menu_all } from '../utils.js'
</script>

<template>
    <TitleBar title="About pCanvas"/>
    <main>
        <div class="msg-container">
            <img class="icon pixel no-ctx-menu" src="../assets/ui/icons/info.png">
            <div class="content">
                <p>
                    <b>Developed by:</b><br>
                    Thanh Vinh Nguyen (itsmevjnk)<br>
                    Deakin University, Melbourne Burwood Campus<br>
                    GitHub: <a href="https://github.com/itsmevjnk" target="_blank">https://github.com/itsmevjnk</a><br>
                    Email: <a href="mailto:s223145883@deakin.edu.au">s223145883@deakin.edu.au</a>
                </p>
                <p>
                    Written in HTML, CSS and JS (JQuery + Vue 3) for the SIT120 2.2C task.
                </p>
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