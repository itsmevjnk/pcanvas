<script setup>
import MenuBar from './MenuBar.vue';
import { store } from '../store.js';
</script>

<template>
    <MenuBar :data="{
        file: {
            name: 'File',
            items: {
                home: {
                    name: 'Back to home',
                    route: '/'
                }
            }
        },

        help: {
            name: 'Help',
            items: {
                howto: {
                    name: 'How to play',
                    route: 'howto'
                },
                about: {
                    name: 'About',
                    route: 'about'
                },

                sep: null,

                contact: {
                    name: 'Contact admin',
                    link: 'mailto:' + store.admin_email
                }
            }
        }
    }"/>
</template>