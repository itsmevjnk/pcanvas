<script setup>
import TitleBar from '../components/TitleBar.vue'
import CanvasMenuBar from '../components/CanvasMenuBar.vue'
import CanvasFooter from '../components/CanvasFooter.vue'
import HorizScrollBar from '../components/HorizScrollBar.vue'
import VertScrollBar from '../components/VertScrollBar.vue'
import {store} from '../info.js'
import { watch } from 'vue'
</script>

<template>
    <TitleBar title="pCanvas"/>
    <CanvasMenuBar/>
    <main id="main-canvas" v-show="!store.ui_test" :style="{
        'max-height': main_height + 'px'
    }">
        <div style="display: flex; flex-direction: row;" :style="{
            height: main_top_height + 'px'
        }">
            <div id="canvas-container">
                <canvas id="canvas" :width="store.canvas.width" :height="store.canvas.height" :style="{
                    width: canvas_width + 'px',
                    height: canvas_height + 'px',
                    top: canvas_top + 'px',
                    left: canvas_left + 'px'
                }"></canvas>
            </div>
            <VertScrollBar v-model="store.drawing.scale" max="10"/>
        </div>
        <HorizScrollBar v-model="store.drawing.scale" max="10"/>
    </main>
    <main v-show="store.ui_test">
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
    </main>
    <CanvasFooter @place="place_pixel"/>
</template>

<script>
export default {
    name: 'HomeView',
    data() {
        return {
            main_height: 0,
            main_top_height: 0,
            canvas: Array(store.canvas.height).fill().map(() => Array(store.canvas.width).fill(15)),
            canvas_container_dimensions: {
                width: NaN,
                height: NaN
            },
            canvas_update: [], // list of pixels to be updated
            canvas_redraw: true, // set to indicate that the canvas needs to be redrawn
            palette: [] // color palette - will be filled in by mounted()
        };
    },

    mounted() {
        /* perform endian test to insert appropriate palette data */
        let buf = new ArrayBuffer(2);
        let buf8 = new Uint8ClampedArray(buf);
        let buf16 = new Uint16Array(buf);
        buf16[0] = 0x55AA;
        if(buf8[0] == 0x55) // big endian
            this.palette = [0x000000FF, 0x800000FF, 0x008000FF, 0x808000FF,
                            0x000080FF, 0x800080FF, 0x008080FF, 0x808080FF,
                            0xC0C0C0FF, 0xFF0000FF, 0x00FF00FF, 0xFFFF00FF,
                            0x0000FFFF, 0xFF00FFFF, 0x00FFFFFF, 0xFFFFFFFF];
        else // little endian
            this.palette = [0xFF000000, 0xFF000080, 0xFF008000, 0xFF008080,
                            0xFF800000, 0xFF800080, 0xFF808000, 0xFF808080,
                            0xFFC0C0C0, 0xFF0000FF, 0xFF00FF00, 0xFF00FFFF,
                            0xFFFF0000, 0xFFFF00FF, 0xFFFFFF00, 0xFFFFFFFF];
        
        /* add watcher for UI test mode switch */
        watch(store.ui_test, (new_val, old_val) => {
            if(new_val) this.handle_resize();
        });
        
        /* listen to window resize event to capture changes in canvas container size */
        window.addEventListener('resize', this.handle_resize);
        this.handle_resize();

        // this.handle_canvas();
    },

    unmounted() {
        window.removeEventListener('resize', this.handle_resize);
    },

    methods: {
        place_pixel() {
            // TODO: backend stuff
            this.canvas[store.drawing.pixel.y][store.drawing.pixel.x] = store.drawing.color; // add pixel to local canvas
            store.drawing.cooldown = true;
            store.drawing.pixel.selected = false;
            this.canvas_update.push([store.drawing.pixel.x, store.drawing.pixel.y]); // add to canvas updating queue
        },

        handle_resize() {
            this.main_height =  parseFloat(getComputedStyle(document.getElementById('app')).height)
                            -   document.getElementsByTagName('header')[0].offsetHeight
                            -   document.getElementsByTagName('nav')[0].offsetHeight
                            -   document.getElementsByTagName('footer')[0].offsetHeight;
            this.main_top_height = this.main_height - document.getElementsByClassName('hscroll-container')[0].offsetHeight;
            
            setTimeout(this.handle_resize_timeout, 1); // give it some time to change
            // console.log(store.drawing.min_scale);
        },

        handle_resize_timeout() {
            let main_elem = document.getElementById('main-canvas');
            while(parseFloat(getComputedStyle(main_elem).maxHeight) != this.main_height) {
                // console.log(getComputedStyle(main_elem).maxHeight + ', expected ' + this.main_height);
            }

            let e = document.getElementById('canvas-container');
            this.canvas_container_dimensions.width = e.offsetWidth;
            this.canvas_container_dimensions.height = e.offsetHeight;
            let scale_norm = store.drawing.scale / store.drawing.min_scale;
            store.drawing.min_scale = this.canvas_scale_multiplier_min / this.canvas_scale_multiplier;
            if(!isNaN(store.drawing.scale)) store.drawing.scale = store.drawing.min_scale * scale_norm;
            else store.drawing.scale = store.drawing.min_scale;

            document.getElementsByClassName('hscroll-container')[0].style.paddingRight = (document.getElementsByClassName('vscroll-container')[0].offsetWidth - 2) + 'px';
        },

        handle_canvas() {
            if(!store.ui_test) {
                /* get the classes we need */
                let canvas = document.getElementById('canvas');
                let ctx = canvas.getContext('2d');
                
                if(this.canvas_redraw) {
                    /* redraw the whole canvas */
                    let img_data = ctx.createImageData(store.canvas.width, store.canvas.height);
                    let img_data_u32 = new Uint32Array(img_data.data.buffer);
                    for(let y = 0; y < store.canvas.height; y++) {
                        for(let x = 0; x < store.canvas.width; x++)
                            img_data_u32[y * store.canvas.width + x] = this.palette[this.canvas[y][x]];
                    }
                    createImageBitmap(img_data).then((img_bitmap) => {
                        ctx.drawImage(img_bitmap, 0, 0);
                    });
                    
                    this.canvas_redraw = false; // prevent re-triggering
                    this.canvas_update = []; // clear the update list (as we have updated all pixels)
                }

                if(this.canvas_update.length > 0) {
                    console.log(this.canvas_update);
                    /* update some pixels */
                    let img_data = ctx.getImageData(0, 0, store.canvas.width, store.canvas.height); // retrieve image data from canvas
                    let img_data_u32 = new Uint32Array(img_data.data.buffer);

                    for(let i = 0; i < this.canvas_update.length; i++) {
                        let x = this.canvas_update[i][0], y = this.canvas_update[i][1];
                        console.log(x);
                        console.log(y)
                        img_data_u32[x * store.canvas.width + x] = this.palette[this.canvas[y][x]]; // 0 - x, 1 - y
                    }
                    this.canvas_update = [];

                    createImageBitmap(img_data).then((img_bitmap) => {
                        ctx.drawImage(img_bitmap, 0, 0);
                    });
                }
            }
            
            requestAnimationFrame(this.handle_canvas); // keep itself running
        }
    },

    computed: {
        canvas_scale_multiplier() {
            let xmul = this.canvas_container_dimensions.width / store.canvas.width;
            let ymul = this.canvas_container_dimensions.height / store.canvas.height;
            return (xmul > ymul) ? xmul : ymul;
        },

        canvas_scale_multiplier_min() {
            let xmul = this.canvas_container_dimensions.width / store.canvas.width;
            let ymul = this.canvas_container_dimensions.height / store.canvas.height;
            return (xmul < ymul) ? xmul : ymul;
        },

        canvas_width() {
            return (store.canvas.width * store.drawing.scale * this.canvas_scale_multiplier);
        },

        canvas_height() {
            return (store.canvas.height * store.drawing.scale * this.canvas_scale_multiplier);
        },

        canvas_left() {
            return ((this.canvas_container_dimensions.width - this.canvas_width) / 2);
        },

        canvas_top() {
            return ((this.canvas_container_dimensions.height - this.canvas_height) / 2);
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
    position: relative;
    background-color: #ffffff;
    image-rendering: pixelated;
}

#canvas-container {
    flex: 1;
    height: 100%;
    overflow: hidden;
}

.hscroll-container {
    width: initial; /* we don't need the 100% from HorizScrollBar */
}
</style>