<script setup>
import Window from './Window.vue';
import axios from 'axios';
import { store } from '../store.js';

const props = defineProps({
    z_index: {
        type: [String, Number],
        default: 3
    }
});

const emits = defineEmits(['cancel', 'done'])
</script>

<template>
    <Window title="Go To..." :z_index="z_index_num" close="true" @close="$emit('cancel')">
        <div class="msg-container" style="margin-bottom: 0;">
            <img class="icon pixel" src="../assets/ui/icons/run.png" v-no-ctx-menu>
            <div class="content">
                Type a canvas pixel coordinate, and pCanvas will take you there.
            </div>
        </div>
        <div class="msg-container fields">
            <span>Go&nbsp;to:</span>
            <div class="field">
                <label for="x">X&nbsp;=</label>
                <input type="number" min="0" :max="store.canvas.width - 1" step="1" v-model="x" name="x">
            </div>
            <div class="field">
                <label for="y">Y&nbsp;=</label>
                <input type="number" min="0" :max="store.canvas.height - 1" step="1" v-model="y" name="y">
            </div>
        </div>
        <div class="button-group">
            <button @click="go_to">OK</button>
            <button @click="$emit('cancel')">Cancel</button>
        </div>
    </Window>
</template>

<script>
export default {
    name: 'LoginWindow',

    data() {
        return {
            x: store.drawing.pixel.x,
            y: store.drawing.pixel.y
        };
    },

    methods: {
        go_to() {
            store.drawing.pixel.x = this.x;
            store.drawing.pixel.y = this.y;
            if(store.user.moderator || !store.canvas.readonly) store.drawing.pixel.selected = true;
            this.$emit('done');
        }
    },

    computed: {
        z_index_num() {
            return parseFloat(this.z_index);
        }
    }
};
</script>

<style scoped>
:deep(.window) {
    max-width: min(30rem, 80vw);
}
.button-group {
    margin-bottom: 1rem;
    margin-right: 0;
}

.button-group button:not(:last-child) {
    margin-right: 0.75rem;
}

.field {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0 0.25rem;
}

.field label {
    margin-right: 0.25rem;
}

.icon {
    min-width: min(4rem, 15vw) !important;
    height: auto;
}

.fields {
    align-items: center;
}

@media screen and (max-width: 825px) {
    .icon {
        max-width: 15vw;
    }

    .msg-container {
        margin-left: 1rem;
        margin-right: 1rem;
    }
}
</style>