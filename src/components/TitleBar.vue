<script setup>
import {RouterLink} from 'vue-router';
const props = defineProps({
    title: String
});
</script>

<template>
    <header class="title-bar">
        <div class="icon-title">
            <img src="/favicon.ico" class="icon">
            <h1>{{ props.title }}</h1>
        </div>
        <RouterLink to="howto" class="button mini"><b>?</b></RouterLink>
    </header>
</template>

<style scoped>
.icon-title {
    display: flex;
    flex-direction: row;
    align-items: center;
}

h1 {
    margin-top: -0.25rem !important;
    line-height: 1.5 !important;
}

.icon {
    width: 1.25rem;
    height: auto;
    margin-right: 0.25rem;
}
</style>