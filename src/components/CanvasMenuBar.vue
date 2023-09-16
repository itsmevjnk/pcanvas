<script setup>
import { store } from '../info.js';
import { GlobalEvents } from 'vue-global-events';
import {RouterLink} from 'vue-router';

import LoginWindow from './LoginWindow.vue';
import LogoutWindow from './LogoutWindow.vue';

const emits = defineEmits(['update:ui_test', 'resize']);
</script>

<template>
    <GlobalEvents @click="click_handler"/>
    <nav class="menu-bar">
        <ul class="categories">
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-file">File</li>
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-view">View</li>
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-help">Help</li>
        </ul>
        <ul id="menu-file" class="menu inactive">
            <li>
                <a @click="login_window = true; close_menu();" v-if="store.user.name == ''">Log in/Register</a>
                <a @click="logout_window = true; close_menu();" v-else>Log out</a>
            </li>
            <li><a href="#">Download canvas</a></li>
        </ul>
        <ul id="menu-view" class="menu inactive">
            <li><a :class="{ disabled: store.drawing.scale >= store.drawing.scale_max }" @click="zoom_in">Zoom in</a></li>
            <li><a :class="{ disabled: store.drawing.scale <= store.drawing.scale_min }" @click="zoom_out">Zoom out</a></li>
            <li class="separator"></li>
            <li><a href="#">Go to...</a></li>
            <li class="separator"></li>
            <li><a href="#">Past canvases</a></li>
            <li class="separator"></li>
            <li>
                <a @click="toggle_ui_test">
                    <template v-if="!ui_test">Toggle UI testing mode</template>
                    <template v-else>Enter drawing mode</template>
                </a>
            </li>
        </ul>
        <ul id="menu-help" class="menu inactive">
            <li><RouterLink to="howto">How to play</RouterLink></li>
            <li><a href="#">What's new</a></li>
            <li><RouterLink to="about">About</RouterLink></li>
            <li class="separator"></li>
            <li><a v-bind:href="'mailto:' + store.admin_email">Contact admin</a></li>
        </ul>
    </nav>
    <LoginWindow @cancel="login_window = false" @done="logio_resize(); login_window = false;" v-if="login_window"/>
    <LogoutWindow @cancel="logout_window = false" @done="logio_resize(); logout_window = false;" v-if="logout_window"/>
</template>

<script>
export default {
    name: 'CanvasMenuBar',
    data() {
        return {
            opened_menu: null,
            login_window: false,
            logout_window: false,
            ui_test: false,

            /* handler for aligning drop-down menu with its category item */
            menu_handler: function() {
                /* TODO: fix updating with != 100% zoom */
                $('.menu').each(function() {
                    let e = $(this);
                    // console.log(e);
                    let bar_item = $('[data-target="' + e.attr('id') + '"]').first();
                    // console.log(bar_item);
                    let bar_item_pos = bar_item.offset();
                    let left = 'calc(' + bar_item_pos.left + 'px - ' + (bar_item.is(':first-child') ? '0.1rem' : '0.3rem') + ')';
                    e.css('left', left);
                });
            }
        };
    },

    mounted() {
        this.menu_handler();
        $(window).resize(this.menu_handler);
        $(window).click(this.click_handler);
        this.$emit('update:ui_test', this.ui_test);;
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

        toggle_ui_test() {
            this.ui_test = !this.ui_test;
            this.$emit('update:ui_test', this.ui_test);
            this.close_menu();
        },
        
        /* functions for handling menu bar */
        activate_menu(id) {
            $('.menu').each(function() {
                let e = $(this);
                if(e.attr('id') !== id) e.addClass('inactive');
                else e.removeClass('inactive');
            });

            $('ul.categories li').each(function() {
                let e = $(this);
                if(e.attr('data-target') !== id) e.removeClass('active');
                else e.addClass('active');
            });
        },

        update_menu() {
            if(this.opened_menu === null) this.activate_menu(''); // will not match any menu --> disable all menu
            else this.activate_menu(this.opened_menu.dataset.target);

            let e = document.querySelector('.menu-bar .menu');
            if(e !== null && getComputedStyle(e).position != 'absolute') this.$emit('resize'); // notify HomeView to take action and resize <main>
        },
        
        /* window click handler */
        click_handler(e) {
            if(this.opened_menu !== null && $(e.target).closest('.menu-bar').length === 0) {
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
            position: unset !important;
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
