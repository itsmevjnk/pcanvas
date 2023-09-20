<script setup>
import { store } from '../store.js'
import TitleBar from '../components/TitleBar.vue'
import { RouterLink } from 'vue-router'
import { disable_ctx_menu_all_onmount } from '../utils.js'

disable_ctx_menu_all_onmount();
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
                Still unsure? Watch this video below:
                <div class="video-wrapper widescreen">
                    <iframe width="560" height="315" :src="'https://www.youtube.com/embed/' + store.tutorial_video" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
                If you have any more questions regarding this app, you can contact its admin <a v-bind:href="'mailto:' + store.admin_email">here</a>.
            </div>
        </div>
    </main>
    <footer>
        <RouterLink to="/" class="button" autofocus>OK</RouterLink>
    </footer>
</template>

<script>
export default {
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

.video-wrapper {
    position: relative;
    height: 0;
    margin: 0.25rem 0;
}

.video-wrapper.widescreen {
    padding-bottom: 56.25%;
}

.video-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

</style>