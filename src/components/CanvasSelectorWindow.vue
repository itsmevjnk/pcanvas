<script setup>
import Window from './Window.vue';
import { disable_ctx_menu_all_onmount, refresh_autofocus_onmount } from '../utils.js';
import axios from 'axios';
import { store } from '../store.js';
import { load_canvas } from '../canvas_procs.js';

const props = defineProps({
    z_index: {
        type: [String, Number],
        default: 3
    }
});

const emits = defineEmits(['cancel', 'done']);

disable_ctx_menu_all_onmount();
refresh_autofocus_onmount();
</script>

<template>
    <Window title="Select canvas" :z_index="z_index_num" close="true" @close="$emit('cancel')">
        <div class="msg-container" style="margin-bottom: 0;">
            <img class="icon pixel no-ctx-menu" src="../assets/ui/icons/run.png">
            <div class="content">
                Select a canvas to view or draw, and pCanvas will take you there.
            </div>
        </div>
        <div class="msg-container" style="align-items: center;">
            <span style="margin-right: 0.5rem;">Go to:</span>
            <div class="select-container">
                <select id="selected-canvas" :disabled="input_disabled">
                    <option v-for="{ id, name, width, height, date } in canvases" :value="id" :selected="id == store.canvas.id">{{ name }} ({{ width }}x{{ height }}, {{ date.replace(/T.*/g, '') }}{{ (id == store.canvas.id) ? ', selected' : '' }})</option>
                </select>
            </div>
        </div>
        <div class="button-group">
            <button @click="go_to" :disabled="input_disabled">OK</button>
            <button @click="$emit('cancel')" :disabled="input_disabled">Cancel</button>
        </div>
    </Window>
</template>

<script>
export default {
    name: 'CanvasSelectorWindow',

    data() {
        return {
            canvases: [],
            input_disabled: false
        }
    },

    methods: {
        update_list() {
            axios.get(store.api + '/canvas/list').then((ls_resp) => {
                this.canvases = ls_resp.data.payload;
                // console.log(this.canvases);
            });
        },

        go_to() {
            this.input_disabled = true;
            for(let i = 0; i < this.canvases.length; i++) {
                if(this.canvases[i].id == parseFloat(document.getElementById('selected-canvas').value)) {
                    store.canvas.id = this.canvases[i].id;
                    store.canvas.name = this.canvases[i].name;
                    store.canvas.width = this.canvases[i].width;
                    store.canvas.height = this.canvases[i].height;
                    break;
                }
            }

            load_canvas(() => {
                this.$emit('done');
            });            
        }
    },

    mounted() {
        this.update_list();
    },

    activated() {
        this.input_disabled = false;
        this.update_list();
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
    max-width: 30rem;
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

.select-container {
    width: unset;
    flex: 1;
}
</style>