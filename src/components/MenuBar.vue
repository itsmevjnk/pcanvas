<script setup>
import { store } from '../info.js';
</script>

<template>
    <nav class="menu-bar">
        <ul>
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-file">File</li>
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-view">View</li>
            <li @mouseover="hover_menu" @click="toggle_menu" data-target="menu-help">Help</li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: 'MenuBar',
    data() {
        return {
            opened_menu: null
        };
    },
    methods: {
        toggle_menu(event) {
            event.target.classList.toggle('active');
            if(this.opened_menu === null) this.opened_menu = event.target;
            else this.opened_menu = null;
        },

        hover_menu(event) {
            if(this.opened_menu !== null && this.opened_menu !== event.target) {
                // console.log('different one');
                this.opened_menu.classList.remove('active');
                event.target.classList.add('active');
                this.opened_menu = event.target;
            }
        }
    }
};
</script>

<style scoped>
    /* navbar for mobile */
    @media screen and (max-width: 825px) {
        .menu-bar ul li {
            flex: 1;
            text-align: center;
        }
    }
</style>
