<script setup>
import TitleBar from '../components/TitleBar.vue'
import CanvasMenuBar from '../components/CanvasMenuBar.vue'
import {store} from '../info.js'
</script>

<template>
    <TitleBar title="pCanvas"/>
    <CanvasMenuBar/>
    <main>
        <!-- <canvas id="canvas"></canvas> -->
        <div class="msg-container">
            <img class="icon" src="../assets/ui/icons/info.png"/>
            <div class="content">
                There is (almost) nothing yet at this point, just a few controls here and there.<br>
                In the meantime, here are some stuff for UI testing:
            </div>
        </div>
        <div style="margin: 0 2rem;">
            <div>
                Canvas scale: {{ canvas_scale }}
            </div>

            <div>
                Selected colour: {{ draw_color }} (<span v-bind:class="'text-' + draw_color">colour test</span>)
            </div>
            
            <div>
                <input type="checkbox" v-model="store.canvas.selected_px.selected"> Pixel selected
            </div>

            <div v-show="store.canvas.selected_px.selected">
                Selected pixel coordinates: 
                X = <input type="number" min="0" v-bind:max="store.canvas.width - 1" v-model="store.canvas.selected_px.x">
                Y = <input type="number" min="0" v-bind:max="store.canvas.height - 1" v-model="store.canvas.selected_px.y">
            </div>

            <div v-show="store.canvas.selected_px.selected">
                <input type="checkbox" v-model="draw_cooldown"> Drawing cooldown triggered
            </div>

            <div>
                Logged in user name: <input type="text" v-model="store.user.name">
            </div>
        </div>
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
            <div id="place-buttons" class="button-group" :class="{ hidden: !store.canvas.selected_px.selected }">
                <button :disabled="draw_cooldown">Place</button>
                <button>Cancel</button>
            </div>
        </div>
        <div class="status-container">
            <div class="status-item flex-60">
                <template v-if="!store.canvas.selected_px.selected">Select a pixel to draw on...</template>
                <template v-else-if="draw_cooldown">You cannot place a pixel right now.</template>
                <template v-else>Select the colour, then click Place to draw.</template>
            </div>
            <div class="status-item flex-15">{{ (store.canvas.selected_px.selected) ? (store.canvas.selected_px.x + ',' + store.canvas.selected_px.y) : '&nbsp;' }}</div>
            <div class="status-item flex-25">
                <template v-if="store.user.name !== ''">Logged in as <b>{{ store.user.name }}</b></template>
                <template v-else>Not logged in</template>
            </div>
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
            draw_cooldown: false,
            canvas_scale: 1
        };
    },

    mounted() {
        // this.canvas_handler();
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

main {
    display: flex;
    flex-direction: column;
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