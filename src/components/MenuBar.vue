<script setup>
import {RouterLink} from 'vue-router';

const props = defineProps({
    data: {
        type: Object,
        default: {}
    }
});
</script>

<template>
    <nav class="menu-bar">
        <ul class="categories">
            <li v-for="(value, key) in props.data" :data-target="key" @mouseover="hover_menu" @click="toggle_menu">{{ value.name }}</li>
        </ul>
        <ul v-for="(m_value, m_key) in props.data" :data-menu="m_key" class="menu wipe-down inactive">
            <li v-for="(i_value, i_key) in m_value.items" :class="{
                separator: i_value == null
            }">
                <template v-if="i_value != null">
                    <a v-if="'action' in i_value" :data-item="i_key" data-itemtype="action" :class="{ disabled: 'disabled' in i_value && i_value.disabled == true }">{{ i_value.name }}</a>
                    <RouterLink v-else-if="'route' in i_value" :to="i_value.route" @click="close_menu" :data-item="i_key" data-itemtype="router_link" :class="{ disabled: 'disabled' in i_value && i_value.disabled == true }">{{ i_value.name }}</RouterLink>
                    <a v-else-if="'link' in i_value" :href="i_value.link" :data-item="i_key" data-itemtype="link" :class="{ disabled: 'disabled' in i_value && i_value.disabled == true }">{{ i_value.name }}</a>
                </template>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: 'MenuBar',
    data() {
        return {
            opened_menu: null,

            /* handler for aligning drop-down menu with its category item */
            menu_handler: function() {
                /* TODO: fix updating with != 100% zoom */
                let elements = document.getElementsByClassName('menu');
                for(let e of elements) {
                    // console.log(e);
                    let bar_item = document.querySelector('[data-target="' + e.dataset.menu + '"]');
                    // console.log(bar_item);
                    let bar_item_pos = bar_item.getBoundingClientRect();
                    // console.log('calc(' + bar_item_pos.left + 'px - ' + ((bar_item == bar_item.parentNode.firstElementChild) ? '0.1rem' : '0.3rem') + ')');
                    e.style.setProperty('left', 'calc(' + bar_item_pos.left + 'px - ' + ((bar_item == bar_item.parentNode.firstElementChild) ? '0.1rem' : '0.3rem') + ')');
                }
            }
        };
    },

    mounted() {
        /* set up click event handlers for action items */
        Object.entries(this.data).forEach((m_entry) => {
            let [m_key, m_value] = m_entry;
            Object.entries(m_value.items).forEach((i_entry) => {
                let [i_key, i_value] = i_entry;
                if(i_value != null && 'action' in i_value) {
                    let e = document.querySelector('[data-item=' + i_key + ']');
                    // console.log(e);
                    e.addEventListener('click', (event) => {
                        i_value.action(event);
                        this.close_menu();
                    });
                }
            });
        });

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

        /* functions for handling menu bar */
        activate_menu(id) {
            let menu_elements = document.getElementsByClassName('menu');
            for(let e of menu_elements) {
                if(e.dataset.menu !== id) e.classList.add('inactive');
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
