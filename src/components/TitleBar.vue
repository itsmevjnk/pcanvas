<script setup>
const props = defineProps({
    title: String
});
</script>

<template>
    <header class="title-bar">
        <h1>{{ props.title }}</h1>
        <button class="mini"><b>?</b></button>
    </header>
</template>