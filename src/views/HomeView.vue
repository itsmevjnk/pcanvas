<script setup>
import TitleBar from '../components/TitleBar.vue'
import CanvasMenuBar from '../components/CanvasMenuBar.vue'
import CanvasFooter from '../components/CanvasFooter.vue'
import HorizScrollBar from '../components/HorizScrollBar.vue'
import VertScrollBar from '../components/VertScrollBar.vue'
import { disable_ctx_menu_all } from '../utils.js'
import {store} from '../info.js'
import { watch } from 'vue'
</script>

<template>
    <TitleBar title="pCanvas"/>
    <CanvasMenuBar @update:ui_test="handle_ui_test_change"/>
    <main id="main-canvas" v-show="!ui_test" :style="{
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
                }" class="no-ctx-menu" @mousedown.left = "handle_canvas_click"></canvas>
                <div id="pointer" v-show="store.drawing.pixel.selected" :style="{
                    width: store.drawing.scale + 'px',
                    height: store.drawing.scale + 'px',
                    top: 'calc(' + pointer_y + 'px - 0.3rem)',
                    left: 'calc(' + pointer_x + 'px - 0.3rem)'
                }"></div>
            </div>
            <VertScrollBar v-model="store.drawing.camera.y" :scale="scroll_scale" :max="(cam_y_absmax == 0) ? 0 : 2"/>
        </div>
        <HorizScrollBar v-model="store.drawing.camera.x" :scale="scroll_scale" :max="(cam_x_absmax == 0) ? 0 : 2"/>
    </main>
    <main v-show="ui_test">
        <div class="msg-container">
            <img class="icon pixel no-ctx-menu" src="../assets/ui/icons/warning.png"/>
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
                Camera centre point:
                X = <input type="number" min="0" max="2" v-model="store.drawing.camera.x">
                Y = <input type="number" min="0" max="2" v-model="store.drawing.camera.y">
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
            ui_test: false,
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
        
        disable_ctx_menu_all(); // disable context menu for canvas

        /* listen to window resize event to capture changes in canvas container size */
        window.addEventListener('resize', this.handle_resize);
        this.handle_resize();

        this.handle_canvas();
    },

    unmounted() {
        window.removeEventListener('resize', this.handle_resize);
    },

    methods: {
        place_pixel() {
            // TODO: backend stuff
            this.canvas[store.drawing.pixel.y][store.drawing.pixel.x] = store.drawing.color; // add pixel to local canvas
            // store.drawing.cooldown = true;
            store.drawing.pixel.selected = false;
            this.canvas_update.push([store.drawing.pixel.x, store.drawing.pixel.y]); // add to canvas updating queue
        },

        handle_resize() {
            this.main_height =  parseFloat(getComputedStyle(document.getElementById('app')).height)
                            -   document.getElementsByTagName('header')[0].offsetHeight
                            -   document.getElementsByTagName('nav')[0].offsetHeight
                            -   document.getElementsByTagName('footer')[0].offsetHeight;
            this.main_top_height = this.main_height - document.getElementsByClassName('hscroll-container')[0].offsetHeight;
            
            setTimeout(this.handle_resize_timeout, 10); // give it some time to change
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
            
            store.drawing.scale_min = Math.ceil(Math.max(store.drawing.scale_min_min, this.canvas_container_dimensions.width / store.canvas.width, this.canvas_container_dimensions.height / store.canvas.height));
            if(store.drawing.scale < store.drawing.scale_min) store.drawing.scale = store.drawing.scale_min;

            // console.log(this.scroll_scale);

            document.getElementsByClassName('hscroll-container')[0].style.paddingRight = (document.getElementsByClassName('vscroll-container')[0].offsetWidth - 2) + 'px';
        },

        handle_ui_test_change(val) {
            this.ui_test = val;
            if(!val) setTimeout(this.handle_ui_test_change_timeout, 1);
        },

        handle_ui_test_change_timeout() {
            while(document.getElementById('main-canvas') == 0) {
                // wait
            }
            this.handle_resize();
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
                        // console.log(x);
                        // console.log(y)
                        img_data_u32[y * store.canvas.width + x] = this.palette[this.canvas[y][x]]; // 0 - x, 1 - y
                    }
                    this.canvas_update = [];

                    createImageBitmap(img_data).then((img_bitmap) => {
                        ctx.drawImage(img_bitmap, 0, 0);
                    });
                }
            }
            
            requestAnimationFrame(this.handle_canvas); // keep itself running
        },

        handle_canvas_click(event) {
            // console.log(event.offsetX);
            // console.log(event.offsetY);
            let x = event.offsetX; if(x < 0) x = 0;
            let y = event.offsetY; if(y < 0) y = 0;
            store.drawing.pixel.x = Math.floor(x / store.drawing.scale);
            store.drawing.pixel.y = Math.floor(y / store.drawing.scale);
            store.drawing.pixel.selected = true;
            // this.place_pixel();
            // store.drawing.pixel.selected = true;
            console.log([this.pointer_x, this.pointer_y]);
        }
    },

    computed: {
        scroll_scale() {
            return Math.min((50 * store.drawing.scale / store.drawing.scale_max), 90) + '%';
        },

        canvas_width() {
            return (store.canvas.width * store.drawing.scale);
        },

        canvas_height() {
            return (store.canvas.height * store.drawing.scale);
        },

        canvas_left() {
            return ((this.canvas_container_dimensions.width - this.canvas_width) / 2 - (store.drawing.camera.x - 1) * this.cam_x_absmax);
        },

        canvas_top() {
            return ((this.canvas_container_dimensions.height - this.canvas_height) / 2 - (store.drawing.camera.y - 1) * this.cam_y_absmax);
        },

        cam_x_absmax() {
            let m = (this.canvas_width - this.canvas_container_dimensions.width) / 2;
            return (m < 0) ? -m : m;
        },

        cam_y_absmax() {
            let m = (this.canvas_height - this.canvas_container_dimensions.height) / 2;
            return (m < 0) ? -m : m;
        },

        pointer_x() {
            return store.drawing.pixel.x * store.drawing.scale - (store.drawing.camera.x) * this.cam_x_absmax + 0.5;
        },

        pointer_y() {
            return store.drawing.pixel.y * store.drawing.scale - (store.drawing.camera.y) * this.cam_y_absmax + 0.5;
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
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
}

.hscroll-container {
    width: initial; /* we don't need the 100% from HorizScrollBar */
}

#pointer {
    position: absolute;
    border: 0.3rem solid lime;
}
</style>