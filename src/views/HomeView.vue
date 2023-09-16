<script setup>
import TitleBar from '../components/TitleBar.vue'
import CanvasMenuBar from '../components/CanvasMenuBar.vue'
import CanvasFooter from '../components/CanvasFooter.vue'
import CanvasPointer from '../components/CanvasPointer.vue'
import { disable_ctx_menu_all } from '../utils.js'
import {store} from '../store.js'
import { ref, watch } from 'vue'
import axios from 'axios'
import { socket } from '../socket.js'

const canvas_container = ref(null);
</script>

<template>
    <TitleBar title="pCanvas"/>
    <CanvasMenuBar @update:ui_test="handle_ui_test_change" @resize="handle_resize"/>
    <main id="main-canvas" v-show="!ui_test" :style="{
        'max-height': main_height + 'px'
    }">
        <div style="display: flex; flex-direction: row;" :style="{
            height: 'calc(' + main_height + 'px - 0.1rem)'
        }">
            <div id="canvas-container" ref="canvas_container">
                <canvas id="canvas" :width="store.canvas.width" :height="store.canvas.height" :style="{
                    width: canvas_width + 'px',
                    height: canvas_height + 'px'
                }" class="no-ctx-menu" @mousedown.left = "handle_canvas_click"></canvas>
                <CanvasPointer id="pointer" v-show="store.drawing.pixel.selected"
                    :width="store.drawing.scale + 'px'" :height="store.drawing.scale + 'px'"
                    :x="'calc(' + pointer_x + 'px - 0.3rem)'" :y="'calc(' + pointer_y + 'px - 0.3rem)'"/>
            </div>
        </div>
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
            canvas: null,
            canvas_update: [], // list of pixels to be updated
            canvas_redraw: true, // set to indicate that the canvas needs to be redrawn
            ui_test: false,
            cooldown_handler: null,
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

        /* fetch user status */
        axios.get(store.api + '/auth/query', { withCredentials: true }).then((resp) => {
            // console.log(resp.data.payload);
            if(resp.data.payload.email !== undefined) {
                store.user.name = resp.data.payload.user;
                store.user.moderator = resp.data.payload.moderator;
            } else {
                this.$cookies.remove('id');
                this.$cookies.remove('token');
            }
            
        }).catch((error) => {
            // TODO: do something?
        });

        /* fetch canvas */
        axios.get(store.api + '/canvas/list?limit=1').then((ls_resp) => {
            store.canvas.width = ls_resp.data.payload[0].width;
            store.canvas.height = ls_resp.data.payload[0].height;
            store.canvas.id = ls_resp.data.payload[0].id;
            store.canvas.name = ls_resp.data.payload[0].name;
            
            this.canvas = Array(store.canvas.height).fill().map(() => Array(store.canvas.width).fill(15));

            axios.get(store.api + '/canvas/' + store.canvas.id + '/fetch').then((f_resp) => {
                /* populate pixels */
                f_resp.data.payload.forEach((pixel) => {
                    // console.log(pixel);
                    let x = pixel.offset % store.canvas.width;
                    let y = Math.floor(pixel.offset / store.canvas.width);
                    this.canvas[y][x] = pixel.color;
                });

                axios.get(store.api + '/canvas/' + store.canvas.id + '/cooldown', { withCredentials: true }).then((c_resp) => {
                    /* get cooldown timer */
                    // console.log(c_resp.data);
                    store.drawing.cooldown = c_resp.data.payload.timer;
                }).catch((err) => {
                    // TODO: do something?
                }).finally(() => {
                    /* listen to window resize event to capture changes in canvas container size */
                    window.addEventListener('resize', this.handle_resize);
                    this.handle_resize();

                    /* set up zoom scale watch - must be done AFTER minimum scale calculation */
                    watch(
                        () => store.drawing.scale,
                        this.handle_scale_change
                    );

                    /* set up WebSocket */
                    socket.on('place', this.handle_ws_place);
                    socket.emit('subscribe', store.canvas.id);

                    /* start canvas handling */
                    this.handle_canvas();
                });
            });
        });
    },

    unmounted() {
        window.removeEventListener('resize', this.handle_resize);
        socket.emit('unsubscribe', store.canvas.id); // unsubscribe from canvas
        socket.off('place', this.handle_ws_place);
    },

    methods: {
        place_pixel() {
            if(store.drawing.cooldown > 0) return; // cooldown is not over
            axios.put(store.api + '/canvas/' + store.canvas.id + '/place', {
                offset: store.drawing.pixel.y * store.canvas.width + store.drawing.pixel.x,
                color: store.drawing.color
            }, { withCredentials: true }).then((resp) => {
                store.drawing.cooldown = resp.data.payload.timer;
                store.drawing.pixel.selected = false;
                // console.log(store.drawing);
                this.set_cooldown_timer();
            });
        },

        set_cooldown_timer() {
            if(store.drawing.cooldown > 0 && this.cooldown_handler === null)
                this.cooldown_handler = setInterval(() => {
                    store.drawing.cooldown--;
                    if(store.drawing.cooldown == 0) {
                        clearInterval(this.cooldown_handler);
                        this.cooldown_handler = null;
                    }
                }, 1000);
        },

        handle_ws_place(payload) {
            let x = payload.offset % store.canvas.width, y = Math.floor(payload.offset / store.canvas.width);
            this.canvas[y][x] = payload.color;
            this.canvas_update.push([x, y]);
        },

        handle_resize() {
            this.main_height =  parseFloat(getComputedStyle(document.getElementById('app')).height)
                            -   document.getElementsByTagName('header')[0].offsetHeight
                            -   document.getElementsByTagName('nav')[0].offsetHeight
                            -   document.getElementsByTagName('footer')[0].offsetHeight;
            
            setTimeout(this.handle_resize_timeout, 10); // give it some time to change
            // console.log(store.drawing.min_scale);
        },

        handle_resize_timeout() {
            let main_elem = document.getElementById('main-canvas');
            while(parseFloat(getComputedStyle(main_elem).maxHeight) != this.main_height) {
                // console.log(getComputedStyle(main_elem).maxHeight + ', expected ' + this.main_height);
            }

            let e = this.$refs.canvas_container;        
            store.drawing.scale_min = Math.ceil(Math.max(store.drawing.scale_min_min, e.clientWidth / store.canvas.width, e.clientHeight / store.canvas.height));
            if(store.drawing.scale < store.drawing.scale_min) store.drawing.scale = store.drawing.scale_min;

            // console.log(this.scroll_scale);

            // document.getElementsByClassName('hscroll-container')[0].style.paddingRight = (document.getElementsByClassName('vscroll-container')[0].offsetWidth - 2) + 'px';
        },

        handle_ui_test_change(val) {
            this.ui_test = val;
            if(!val) setTimeout(this.handle_ui_test_change_timeout, 10);
        },

        handle_ui_test_change_timeout() {
            this.handle_resize();
        },

        handle_canvas() {
            if(!store.ui_test) {
                /* get the classes we need */
                let canvas = document.getElementById('canvas');
                if(canvas === null) return; // nothing else to do, now that the canvas is gone
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
                    // console.log(this.canvas_update);
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
            // console.log([this.pointer_x, this.pointer_y]);
        },

        handle_scale_change(new_scale, old_scale) {
            // console.log(new_scale, old_scale);
            
            /* calculate camera center point location (pixel) */
            let container = this.$refs.canvas_container;
            let center_x = (container.scrollLeft + container.clientWidth / 2) / old_scale;
            let center_y = (container.scrollTop + container.clientHeight / 2) / old_scale;
            // console.log(center_x, center_y);

            /* work back to expected camera position under new scale */
            let scroll_x = center_x * new_scale - container.clientWidth / 2;
            let scroll_y = center_y * new_scale - container.clientHeight / 2;

            /* perform bounds checking */
            if(scroll_x < 0) scroll_x = 0;
            else if(scroll_x > this.canvas_width - container.clientWidth) scroll_x = this.canvas_width - container.clientWidth;
            if(scroll_y < 0) scroll_y = 0;
            else if(scroll_y > this.canvas_height - container.clientHeight) scroll_y = this.canvas_height - container.clientHeight;

            /* set new scroll position */
            container.scrollLeft = scroll_x;
            container.scrollTop = scroll_y;
        }
    },

    computed: {
        canvas_width() {
            return (store.canvas.width * store.drawing.scale);
        },

        canvas_height() {
            return (store.canvas.height * store.drawing.scale);
        },
        
        pointer_x() {
            return store.drawing.pixel.x * store.drawing.scale + 1;
        },

        pointer_y() {
            return store.drawing.pixel.y * store.drawing.scale + 1;
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
    overflow: auto;
}

#main-canvas {
    border-bottom: 0.1rem solid #ffffff;
    border-right: 0.1rem solid #ffffff;
    box-sizing: border-box;
}

@keyframes blinker {
    50% {
        border-color: #ff0000;
    }
}

#pointer {
    border-color: #00ff00;
    animation: blinker 1s step-start infinite;
}
</style>