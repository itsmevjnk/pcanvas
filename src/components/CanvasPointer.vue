<script setup>
const props = defineProps({
    width: String,
    height: String,
    x: String,
    y: String,
    class: {
        type: String,
        default: ''
    },
    id: {
        type: String,
        default: ''
    }
});
</script>

<template>
    <div class="pointer" :id="props.id" :class="props.class" :style="{
        width: props.width,
        height: props.height,
        top: props.y,
        left: props.x
    }">

    </div>
</template>

<script>
export default {
    name: 'CanvasPointer',
};
</script>

<style scoped>
.pointer {
    position: absolute;
    border-style: solid;
    border-width: 0.3rem;
    pointer-events: none;
}
</style>