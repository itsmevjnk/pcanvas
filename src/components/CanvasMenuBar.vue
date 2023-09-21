<script setup>
import { store } from '../store.js';
import { GlobalEvents } from 'vue-global-events';
import {RouterLink} from 'vue-router';

import LoginWindow from './LoginWindow.vue';
import LogoutWindow from './LogoutWindow.vue';
import GoToWindow from './GoToWindow.vue';

const emits = defineEmits(['resize', 'center_camera']);
</script>

<template>
    <GlobalEvents @click="click_handler"/>
    <nav class="menu-bar">
        <ul class="categories">
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-file">File</li>
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-view">View</li>
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-help">Help</li>
        </ul>
        <ul id="menu-file" class="menu wipe-down inactive">
            <li>
                <a @click="login_window = true; close_menu();" v-if="store.user.name == ''">Log in/Register</a>
                <a @click="logout_window = true; close_menu();" v-else>Log out</a>
            </li>
            <li><a @click="download_canvas">Download canvas</a></li>
        </ul>
        <ul id="menu-view" class="menu wipe-down inactive">
            <li><a :class="{ disabled: store.drawing.scale >= store.drawing.scale_max }" @click="zoom_in">Zoom in</a></li>
            <li><a :class="{ disabled: store.drawing.scale <= store.drawing.scale_min }" @click="zoom_out">Zoom out</a></li>
            <li class="separator"></li>
            <li><a href="#" @click="goto_window = true; close_menu();">Go to...</a></li>
            <li class="separator"></li>
            <li><a href="#">Past canvases</a></li>
        </ul>
        <ul id="menu-help" class="menu wipe-down inactive">
            <li><RouterLink to="howto" @click="close_menu">How to play</RouterLink></li>
            <li><a href="#">What's new</a></li>
            <li><RouterLink to="about" @click="close_menu">About</RouterLink></li>
            <li class="separator"></li>
            <li><a v-bind:href="'mailto:' + store.admin_email">Contact admin</a></li>
        </ul>
    </nav>
    <LoginWindow @cancel="login_window = false" @done="logio_resize(); login_window = false;" v-if="login_window"/>
    <LogoutWindow @cancel="logout_window = false" @done="logio_resize(); logout_window = false;" v-if="logout_window"/>
    <GoToWindow @cancel="goto_window = false" @done="goto_window = false; $emit('center_camera');" v-if="goto_window"/>
</template>

<script>
export default {
    name: 'CanvasMenuBar',
    data() {
        return {
            opened_menu: null,
            login_window: false,
            logout_window: false,
            goto_window: false,

            /* handler for aligning drop-down menu with its category item */
            menu_handler: function() {
                /* TODO: fix updating with != 100% zoom */
                let elements = document.getElementsByClassName('menu');
                for(let e of elements) {
                    // console.log(e);
                    let bar_item = document.querySelector('[data-target="' + e.id + '"]');
                    // console.log(bar_item);
                    let bar_item_pos = bar_item.getBoundingClientRect();
                    // console.log('calc(' + bar_item_pos.left + 'px - ' + ((bar_item == bar_item.parentNode.firstElementChild) ? '0.1rem' : '0.3rem') + ')');
                    e.style.setProperty('left', 'calc(' + bar_item_pos.left + 'px - ' + ((bar_item == bar_item.parentNode.firstElementChild) ? '0.1rem' : '0.3rem') + ')');
                }
            }
        };
    },

    mounted() {
        this.menu_handler();
        window.addEventListener('resize', this.menu_handler);
        window.addEventListener('click', this.click_handler);
    },

    unmounted() {
        window.removeEventListener('resize', this.menu_handler);
        window.removeEventListener('click', this.click_handler);
    },

    methods: {
        close_menu() {
            this.opened_menu = null;
            this.update_menu();
        },
        
        toggle_menu(event) {
            if(this.opened_menu === null) this.opened_menu = event.target;
            else this.opened_menu = null;
            this.update_menu();
        },

        hover_menu(event) {
            if(this.opened_menu !== null && this.opened_menu !== event.target) {
                this.opened_menu = event.target;
                this.update_menu();
            }
        },

        zoom_in() {
            if(store.drawing.scale < store.drawing.scale_max) {
                store.drawing.scale++;
                this.close_menu();
            }
        },

        zoom_out() {
            if(store.drawing.scale > store.drawing.scale_min) {
                store.drawing.scale--;
                this.close_menu();
            }
        },
        
        /* functions for handling menu bar */
        activate_menu(id) {
            let menu_elements = document.getElementsByClassName('menu');
            for(let e of menu_elements) {
                if(e.id !== id) e.classList.add('inactive');
                else e.classList.remove('inactive');
            }

            let cat_elements = document.querySelectorAll('ul.categories li');
            for(let e of cat_elements) {
                if(e.dataset.target !== id) e.classList.remove('active');
                else e.classList.add('active');
            }
        },

        update_menu() {
            if(this.opened_menu === null) this.activate_menu(''); // will not match any menu --> disable all menu
            else this.activate_menu(this.opened_menu.dataset.target);

            let e = document.querySelector('.menu-bar .menu');
            if(e !== null && getComputedStyle(e).position != 'absolute') this.$emit('resize'); // notify HomeView to take action and resize <main>
        },
        
        /* window click handler */
        click_handler(e) {
            if(this.opened_menu !== null && e.target.closest('.menu-bar') === null) {
                this.opened_menu = null;
                this.update_menu();
            }
        },

        logio_resize() {
            if(getComputedStyle(document.querySelector('.actions')).flexDirection == 'column') {
                setInterval(() => {
                    this.$emit('resize');
                }, 10); // allow some time for the UI to update before requesting resize
            }
        },

        download_canvas() {
            let canvas = document.getElementById('canvas');
            if(canvas !== null) {
                var link = document.createElement('a');
                link.download = 'canvas.png';
                link.href = canvas.toDataURL();
                link.click();
            }
        }
    }
};
</script>

<style scoped>
    /* navbar for mobile */
    @media screen and (max-width: 825px) {
        .menu-bar ul.categories li {
            flex: 1;
            text-align: center;
        }

        .menu {
            left: 0 !important;
            width: calc(100% - 1rem);
        }

        .wipe-down {
            animation: none !important;
        }
    }

    .menu {
        position: absolute;
        z-index: 100;
    }

    .menu.inactive {
        display: none !important;
    }
</style>
