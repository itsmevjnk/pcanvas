<script setup>
import TitleBar from '../components/TitleBar.vue'
import { RouterLink } from 'vue-router'
import { disable_ctx_menu_all } from '../utils.js'

import { GoogleMap, Marker } from 'vue3-google-map'
import { maps } from '../maps.js'
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
                <GoogleMap :api-key="maps.api" :center="maps.center" :zoom="maps.zoom" :style="{
                    width: '100%',
                    height: '25vh'
                }">
                    <Marker :options="{
                        position: maps.center
                    }"/>
                </GoogleMap>
                <p>
                    Written in HTML, CSS and JS (JQuery + Vue 3) for the SIT120 2.2C and 3.1D tasks.<br>
                    Backend written in JS (NodeJS + Express) as part of the SIT120 3.1D task.
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