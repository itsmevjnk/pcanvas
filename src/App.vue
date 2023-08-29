<script setup>
import { RouterLink, RouterView } from 'vue-router'
import TitleBar from './components/TitleBar.vue'
import MenuBar from './components/MenuBar.vue'
</script>

<template>
    <TitleBar/>
    <MenuBar/>
    <RouterView/>
</template>

<script>

</script>