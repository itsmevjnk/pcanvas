<script setup>
import {RouterLink} from 'vue-router';
const props = defineProps({
    title: String
});
</script>

<template>
    <header class="title-bar">
        <h1>{{ props.title }}</h1>
        <RouterLink to="howto" class="button mini"><b>?</b></RouterLink>
    </header>
</template>