<script setup>
import { store } from '../info.js';
import { GlobalEvents } from 'vue-global-events';
import {RouterLink} from 'vue-router';
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
            <li><a href="#">Log in/Register</a></li>
            <li><a href="#">Download canvas</a></li>
        </ul>
        <ul id="menu-view" class="menu inactive">
            <li><a href="#">Zoom in</a></li>
            <li class="disabled"><a href="#">Zoom out</a></li>
            <li class="separator"></li>
            <li><a href="#">Go to...</a></li>
            <li class="separator"></li>
            <li><a href="#">Past canvases</a></li>
        </ul>
        <ul id="menu-help" class="menu inactive">
            <li><a href="#">How to play</a></li>
            <li><a href="#">What's new</a></li>
            <li><RouterLink to="about">About</RouterLink></li>
            <li class="separator"></li>
            <li><a href="mailto:s223145883@deakin.edu.au">Contact admin</a></li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: 'CanvasMenuBar',
    data() {
        return {
            opened_menu: null,

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
    },

    methods: {
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
        },
        
        /* window click handler */
        click_handler(e) {
            if(this.opened_menu !== null && $(e.target).closest('.menu-bar').length === 0) {
                this.opened_menu = null;
                this.update_menu();
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
