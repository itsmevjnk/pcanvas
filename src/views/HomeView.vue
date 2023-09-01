<script setup>
import TitleBar from '../components/TitleBar.vue'
import CanvasMenuBar from '../components/CanvasMenuBar.vue'
import CanvasFooter from '../components/CanvasFooter.vue'
import {store} from '../info.js'
</script>

<template>
    <TitleBar title="pCanvas"/>
    <CanvasMenuBar/>
    <main>
        <canvas id="canvas" v-if="!store.ui_test"></canvas>
        <template v-else>
            <div class="msg-container">
                <img class="icon" src="../assets/ui/icons/warning.png"/>
                <div class="content">
                    There is (almost) nothing yet at this point, just a few controls here and there.<br>
                    In the meantime, here are some stuff for UI testing:
                </div>
            </div>
            <div style="margin: 0 2rem;">
                <div>
                    Canvas scale: {{ store.drawing.scale }}
                </div>

                <div>
                    Selected colour: {{ store.drawing.color }} (<span v-bind:class="'text-' + store.drawing.color">colour test</span>)
                </div>
                
                <div>
                    <input type="checkbox" v-model="store.drawing.pixel.selected"> Pixel selected
                </div>

                <div v-show="store.drawing.pixel.selected">
                    Selected pixel coordinates: 
                    X = <input type="number" min="0" v-bind:max="store.canvas.width - 1" v-model="store.drawing.pixel.x">
                    Y = <input type="number" min="0" v-bind:max="store.canvas.height - 1" v-model="store.drawing.pixel.y">
                </div>

                <div v-show="store.drawing.pixel.selected">
                    <input type="checkbox" v-model="store.drawing.cooldown"> Drawing cooldown triggered
                </div>

                <div>
                    Logged in user name: <input type="text" v-model="store.user.name">
                </div>
            </div>
        </template>
    </main>
    <CanvasFooter @place="place_pixel"/>
</template>

<script>
export default {
    name: 'HomeView',
    data() {
        return {
            canvas: Array(store.canvas.height).fill().map(() => Array(store.canvas.width).fill(15)),
            canvas_init: true
        };
    },

    mounted() {
        this.canvas_handler();
    },

    methods: {
        place_pixel() {
            // TODO: backend stuff
            store.drawing.cooldown = true;
            store.drawing.pixel.selected = false;
        },

        canvas_handler() {
            if(!store.ui_test) {
                /* draw something on the canvas */
                var canvas = document.getElementById('canvas');
                canvas.width = Math.floor(canvas.clientWidth);
                canvas.height = Math.floor(canvas.clientHeight) - 8;
                var ctx = canvas.getContext('2d');
                ctx.font = '10px Courier';
                ctx.fillText('Hello, World!', 100, 100);
            }

            requestAnimationFrame(this.canvas_handler); // this keeps itself running
        }
    }
};
</script>

<style scoped>
main {
    display: flex;
    flex-direction: column;
}

canvas {
    flex: 1;
    background-color: #ffffff;
}
</style>