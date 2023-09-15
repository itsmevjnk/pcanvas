<script setup>
import { ref } from 'vue';

const props = defineProps({
    z_index: {
        type: [String, Number],
        default: 3
    },
    blocking: { // none, blocking, blocking-bg
        type: String,
        default: 'none'
    },
    moveable: {
        type: [String, Boolean],
        default: true
    },
    title: String
});

const window_container = ref(null);
</script>

<template>
    <div class="window-container" :style="{
        'z-index': props.z_index + ''
    }" :class="{
        'non-blocking': props.blocking.toLowerCase() === 'none',
        'blocking': props.blocking.toLowerCase() === 'blocking' || props.blocking.toLowerCase() === 'blocking-bg',
        'bg-checker-black': props.blocking.toLowerCase() === 'blocking-bg'
    }" ref="window_container">
        <div class="window" :style="{
            'top': this.offset.y + 'px',
            'left': this.offset.x + 'px'
        }">
            <div class="title-bar" @mousemove="handle_drag">
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

    mounted() {
        window.addEventListener('mousedown', this.handle_click);
        window.addEventListener('resize', this.handle_resize);
        // console.log(typeof this.moveable);
    },

    unmounted() {
        window.removeEventListener('mousedown', this.handle_click);
        window.removeEventListener('resize', this.handle_resize);
    },

    methods: {
        handle_click(event) {
            if(event.buttons & 1 == 0) return; // we only handle left click events
            if(event.target === this.$refs.window_container || this.$refs.window_container.contains(event.target)) {
                // console.log('inside');
                if(this.blocking === 'none') this.$refs.window_container.classList.remove('inactive');
            } else {
                // console.log('outside');
                if(this.blocking === 'none') this.$refs.window_container.classList.add('inactive');
            }
        },

        handle_drag(event) {
            if(this.moveable_bool && event.buttons & 1) {
                // left button
                this.offset.x += event.movementX;
                this.offset.y += event.movementY;
            }
        },

        handle_resize(event) {
            // console.log(this.offset);
            let x_absmax = (window.innerWidth + this.$refs.window_container.offsetWidth) / 2;
            // console.log(x_absmax);
            if(this.offset.x < -x_absmax) this.offset.x = -0.9 * x_absmax;
            else if(this.offset.x > x_absmax) this.offset.x = 0.9 * x_absmax;
            let y_absmax = (window.innerHeight - this.$refs.window_container.offsetHeight) / 2;
            // console.log(y_absmax);
            if(this.offset.y < -y_absmax) this.offset.y = -0.9 * y_absmax;
            else if(this.offset.y > y_absmax) this.offset.y = 0.9 * y_absmax;
        }
    },

    computed: {
        moveable_bool() {
            if(typeof this.moveable === 'boolean') return this.moveable;
            else return (this.moveable.toLowerCase() != 'false');
        }
    }
};
</script>

<style scoped>
.window {
    width: max-content;
    height: max-content;
    max-width: 80vw;
    max-height: 80vh;
    user-select: none;
}
</style>