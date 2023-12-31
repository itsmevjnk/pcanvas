<script setup>
import {store} from '../store.js'
</script>

<template>
    <footer>
        <div class="actions">
            <div class="mspaint-colsel" :class="{ 'hidden-login': store.user.name == '' }">
                <div v-bind:class="'cell large bg-' + store.drawing.color"></div>
                <div class="color-board">
                    <div class="row">
                        <div @click="select_color" v-for="color in store.color_board.top" v-bind:class="'cell bg-' + color" v-bind:data-color="color"></div>
                    </div>
                    <div class="row">
                        <div @click="select_color" v-for="color in store.color_board.bottom" v-bind:class="'cell bg-' + color" v-bind:data-color="color"></div>
                    </div>
                </div>
            </div>
            <div id="zoom-slider">
                <span>Small</span>
                <input type="range" :min="store.drawing.scale_min" :max="store.drawing.scale_max" step="1" v-model="store.drawing.scale"/>
                <span>Large</span>
            </div>
            <div id="place-buttons" class="button-group" :class="{
                hidden: !store.drawing.pixel.selected,
                'hidden-login': store.user.name == ''
            }">
                <button :disabled="store.drawing.cooldown > 0 || !store.canvas.ready" @click="$emit('place')">Place</button>
                <button @click="store.drawing.pixel.selected = false" :disabled="!store.canvas.ready">Cancel</button>
            </div>
        </div>
        <div class="status-container">
            <div class="status-item flex-60">
                <template v-if="!store.canvas.ready">Please wait while the canvas loads...</template>
                <template v-else-if="store.user.name == ''">Log in to start placing pixels...</template>
                <template v-else-if="store.drawing.cooldown > 0">You can place another pixel in {{ String(Math.floor(store.drawing.cooldown / 60)).padStart(2, '0') }}:{{ String(store.drawing.cooldown % 60).padStart(2, '0') }}.</template>
                <template v-else-if="store.canvas.readonly && !store.user.moderator">You cannot place pixels on this canvas.</template>
                <template v-else-if="!store.drawing.pixel.selected">Select a pixel to draw on...</template>
                <template v-else>Select the colour, then click Place to draw.</template>
            </div>
            <div class="status-item flex-15">{{ (store.drawing.pixel.selected) ? (store.drawing.pixel.x + ',' + store.drawing.pixel.y) : '&nbsp;' }}</div>
            <div class="status-item flex-25">
                <template v-if="store.user.name !== ''">Logged in as <b>{{ store.user.name }}</b></template>
                <template v-else>Not logged in</template>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'CanvasFooter',

    methods: {
        select_color(event) {
            store.drawing.color = parseInt(event.target.dataset.color);
        }
    }
};
</script>

<style scoped>
footer {   
    padding: 0 0.25rem;
}

.actions {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin: 0.75rem 0;
}

/* Buttons (place/cancel) area */
.button-group {
    margin-left: 0;
    margin-right: 0;
}

/* Zoom slider */
#zoom-slider {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}

#zoom-slider input {
    margin: auto 1.25rem;
    width: min(20vw, 20rem);
}

#zoom-slider span {
    padding-top: 0.25rem;
}

/* Flex scaling for status items */
.flex-60 {
    flex: 0.6;
}

.flex-15 {
    flex: 0.15;
}

.flex-25 {
    flex: 0.25;
}

.hidden-login {
    visibility: hidden;
}

/* Actions div in mobile view */
@media screen and (max-width: 825px) {
    .actions {
        flex-direction: column;
        align-items: center;
    }

    #zoom-slider,
    .actions .mspaint-colsel,
    #place-buttons {
        margin: 0.25rem 0;
    }

    #zoom-slider {
        order: 0;
        height: 2.5rem;
    }

    .actions .mspaint-colsel {
        order: 1;
    }

    #place-buttons {
        order: 2;
    }

    #zoom-slider input {
        width: 40vw;
    }

    .w9x .status-container {
        flex-direction: column;
    }

    .w9x .status-item:not(:last-child) {
        margin-right: 0;
        margin-bottom: 0.25rem;
    }

    .hidden-login {
        display: none;
    }
}

@media screen and (max-width: 425px) {
    #zoom-slider input {
        width: 50vw;
    }
}

</style>