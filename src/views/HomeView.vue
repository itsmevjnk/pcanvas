<script setup>
import TitleBar from '../components/TitleBar.vue'
import CanvasMenuBar from '../components/CanvasMenuBar.vue'
import {store} from '../info.js'
</script>

<template>
    <TitleBar title="pCanvas"/>
    <CanvasMenuBar/>
    <main>
        <canvas id="canvas"></canvas>
    </main>
    <footer>
        <div class="actions">
            <div class="mspaint-colsel">
                <div v-bind:class="'cell large bg-' + draw_color"></div>
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
                <input type="range" min="1" max="10" step="0.1" v-model="canvas_scale"/>
                <span>Large</span>
            </div>
            <div id="place-buttons" :class="{ hidden: !store.canvas.selected_px.selected }">
                <button>Place</button>
                <button>Cancel</button>
            </div>
        </div>
        <div class="status-container">
            <div class="status-item flex-60">Cooldown status goes here</div>
            <div class="status-item flex-15">{{ (store.canvas.selected_px.selected) ? (store.canvas.selected_px.x + ',' + store.canvas.selected_px.y) : '' }}</div>
            <div class="status-item flex-25">Not logged in</div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'HomeView',
    data() {
        return {
            canvas: Array(store.canvas.height).fill().map(() => Array(store.canvas.width).fill(15)),
            draw_color: 0,
            canvas_scale: 1
        };
    },

    mounted() {
        this.canvas_handler();
    },

    methods: {
        select_color(event) {
            this.draw_color = parseInt(event.target.dataset.color);
        },

        canvas_handler() {
            /* draw something on the canvas */
            var canvas = document.getElementById('canvas');
            canvas.width = Math.floor(canvas.clientWidth);
            canvas.height = Math.floor(canvas.clientHeight) - 4;
            var ctx = canvas.getContext('2d');
            ctx.font = '10px Courier';
            ctx.fillText('Hello, World!', 100, 100);

            requestAnimationFrame(this.canvas_handler); // this keeps itself running
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
#place-buttons {
    display: flex;
    flex-direction: row;
    margin: auto 0;
    padding: 0 1rem;
}

#place-buttons button {
    width: 6rem;
}

#place-buttons button:not(:last-child) {
    margin-right: 2rem;
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

main {
    display: flex;
}

canvas {
    flex: 1;
    background-color: #ffffff;
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
}

@media screen and (max-width: 425px) {
    #zoom-slider input {
        width: 50vw;
    }
}

</style>