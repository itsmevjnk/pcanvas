<script setup>
const props = defineProps({
    z_index: {
        type: [String, Number],
        default: 3
    },
    blocking: { // none, blocking, blocking-bg
        type: String,
        default: 'none'
    },
    title: String
});
</script>

<template>
    <div class="window-container" :style="{
        'z-index': props.z_index + ''
    }" :class="{
        'non-blocking': props.blocking.toLowerCase() === 'none',
        'blocking': props.blocking.toLowerCase() === 'blocking' || props.blocking.toLowerCase() === 'blocking-bg',
        'bg-checker-black': props.blocking.toLowerCase() === 'blocking-bg'
    }">
        <div class="window" :style="{
            'top': this.offset.y + 'px',
            'left': this.offset.x + 'px'
        }">
            <div class="title-bar">
                <h1>{{ props.title }}</h1>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Window',

    data() {
        return {
            
            offset: {
                x: 0,
                y: 0
            }
        };
    },


};
</script>

<style scoped>
.window {
    width: fit-content;
    height: fit-content;
}
</style>