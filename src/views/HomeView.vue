<script setup>
import TitleBar from '../components/TitleBar.vue'
import MenuBar from '../components/MenuBar.vue'
import CanvasFooter from '../components/CanvasFooter.vue'
import CanvasPointer from '../components/CanvasPointer.vue'
import {store} from '../store.js'
import { ref, watch } from 'vue'
import axios from 'axios'
import { load_canvas, unsubscribe_canvas_ws } from '../canvas_procs.js'


import LoginWindow from '../components/LoginWindow.vue';
import LogoutWindow from '../components/LogoutWindow.vue';
import GoToWindow from '../components/GoToWindow.vue';
import CanvasSelectorWindow from '../components/CanvasSelectorWindow.vue';

const canvas_container = ref(null);
</script>

<template>
    <TitleBar :title="((store.canvas.name == '') ? '' : (store.canvas.name + ' - ')) + 'pCanvas'"/>
    <MenuBar :data="{
        file: {
            name: 'File',
            items: {
                login: {
                    name: (store.user.name == '') ? 'Log in/Register' : 'Log out',
                    action: () => window.login_logout = true
                },
                download: {
                    name: 'Download canvas',
                    action: download_canvas
                }
            }
        },

        view: {
            name: 'View',
            items: {
                zoom_in: {
                    name: 'Zoom in',
                    disabled: store.drawing.scale >= store.drawing.scale_max,
                    action: () => {
                        if(store.drawing.scale < store.drawing.scale_max) store.drawing.scale++;
                    }
                },
                zoom_out: {
                    name: 'Zoom out',
                    disabled: store.drawing.scale <= store.drawing.scale_min,
                    action: () => {
                        if(store.drawing.scale > store.drawing.scale_min) store.drawing.scale--;
                    }
                },

                sep_1: null,

                go_to: {
                    name: 'Go to...',
                    action: () => window.goto = true
                },

                sep_2: null,

                select_canvas: {
                    name: 'Select canvas...',
                    action: () => window.selector = true
                }
            }
        },

        help: {
            name: 'Help',
            items: {
                howto: {
                    name: 'How to play',
                    route: 'howto'
                },
                about: {
                    name: 'About',
                    route: 'about'
                },

                sep: null,

                contact: {
                    name: 'Contact admin',
                    link: 'mailto:' + store.admin_email
                }
            }
        }
    }"/>
    <main id="main-canvas" :style="{
        'max-height': main_height + 'px'
    }">
        <div style="display: flex; flex-direction: row;" :style="{
            height: 'calc(' + main_height + 'px - 0.1rem)'
        }">
            <div id="canvas-container" ref="canvas_container">
                <canvas id="canvas" :width="store.canvas.width" :height="store.canvas.height" :style="{
                    width: canvas_width + 'px',
                    height: canvas_height + 'px'
                }" v-no-ctx-menu @mousedown.left = "handle_canvas_click" :class="{ nodisp: !store.canvas.ready }"></canvas>
                <CanvasPointer id="pointer" v-show="store.canvas.ready && store.drawing.pixel.selected && (store.user.moderator || !store.canvas.readonly)"
                    :width="store.drawing.scale + 'px'" :height="store.drawing.scale + 'px'"
                    :x="'calc(' + pointer_x + 'px - 0.3rem)'" :y="'calc(' + pointer_y + 'px - 0.3rem)'"/>
            </div>
        </div>
    </main>
    <CanvasFooter @place="place_pixel"/>
    <LoginWindow @cancel="window.login_logout = false" @done="logio_resize(); window.login_logout = false;" v-if="window.login_logout && store.user.name === ''"/>
    <LogoutWindow @cancel="window.login_logout = false" @done="logio_resize(); window.login_logout = false;" v-if="window.login_logout && store.user.name !== ''"/>
    <GoToWindow @cancel="window.goto = false" @done="window.goto = false; center_camera = true;" v-if="window.goto"/>
    <CanvasSelectorWindow @cancel="window.selector = false" @done="window.selector = false" v-if="window.selector"/>
</template>

<script>
export default {
    name: 'HomeView',
    data() {
        return {
            main_height: 0,
            main_top_height: 0,
            center_camera: false, // will be picked up by canvas handler
            min_scale_calculated: false,
            cooldown_handler: null,
            palette: [], // color palette - will be filled in by mounted()
            palette_hexstr: [ // color palette as hex colour strings - used for fillStyle
                '#000000', '#800000', '#008000', '#808000',
                '#000080', '#800080', '#008080', '#808080',
                '#c0c0c0', '#ff0000', '#00ff00', '#ffff00',
                '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
            ],

            window: {
                login_logout: false,
                goto: false,
                selector: false
            }
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
            store.canvas.readonly = ls_resp.data.payload[0].readonly;

            /* set up zoom scale watch */
            watch(
                () => store.drawing.scale,
                this.handle_scale_change
            );
            
            /* listen to window resize event to capture changes in canvas container size */
            window.addEventListener('resize', this.handle_resize);
            this.handle_resize();

            /* start canvas handling */
            this.handle_canvas();

            load_canvas();
        });
    },

    unmounted() {
        window.removeEventListener('resize', this.handle_resize);
        unsubscribe_canvas_ws();
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

        handle_resize() {
            this.main_height =  parseFloat(getComputedStyle(document.getElementById('main-window')).height) - 2 * 0.2 * this.rem_to_px
                            -   document.getElementsByTagName('header')[0].offsetHeight
                            -   document.getElementsByTagName('nav')[0].offsetHeight
                            -   document.getElementsByTagName('footer')[0].offsetHeight;
            
            setTimeout(this.handle_resize_timeout, 10); // give it some time to change
            // console.log(store.drawing.min_scale);
        },

        handle_resize_timeout() {
            let main_elem = document.getElementById('main-canvas');
            if(main_elem == null) return; // no business
            while(Math.round(parseFloat(getComputedStyle(main_elem).maxHeight)) != Math.round(this.main_height)) {
                // console.log(getComputedStyle(main_elem).maxHeight + ', expected ' + this.main_height);
            }

            let e = this.$refs.canvas_container;        
            store.drawing.scale_min = Math.ceil(Math.max(store.drawing.scale_min_min, e.clientWidth / store.canvas.width, e.clientHeight / store.canvas.height));
            if(store.drawing.scale < store.drawing.scale_min) store.drawing.scale = store.drawing.scale_min;

            // console.log(this.scroll_scale);

            // document.getElementsByClassName('hscroll-container')[0].style.paddingRight = (document.getElementsByClassName('vscroll-container')[0].offsetWidth - 2) + 'px';
        },

        handle_canvas() {
            // console.log('handle canvas');
            /* get the classes we need */
            if(store.canvas.contents !== null) {
                let canvas = document.getElementById('canvas');
                if(canvas !== null) {
                    let ctx = canvas.getContext('2d');
                    
                    if(store.canvas.redraw) {
                        /* redraw the whole canvas */
                        let img_data = ctx.createImageData(store.canvas.width, store.canvas.height);
                        let img_data_u32 = new Uint32Array(img_data.data.buffer);
                        for(let y = 0; y < store.canvas.height; y++) {
                            for(let x = 0; x < store.canvas.width; x++)
                                img_data_u32[y * store.canvas.width + x] = this.palette[store.canvas.contents[y][x]];
                        }
                        createImageBitmap(img_data).then((img_bitmap) => {
                            ctx.drawImage(img_bitmap, 0, 0);
                        });
                        
                        store.canvas.redraw = false; // prevent re-triggering
                        store.canvas.update = []; // clear the update list (as we have updated all pixels)
                    }

                    if(store.canvas.update.length > 0) {
                        // console.log(store.canvas.update);
                        /* update some pixels - we'll use fillRect */
                        while(store.canvas.update.length > 0) {
                            let [x, y] = store.canvas.update.pop();
                            ctx.fillStyle = this.palette_hexstr[store.canvas.contents[y][x]];
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }

                    /* center camera to selected pixel if requested */
                    if(this.center_camera && this.$refs.canvas_container.clientHeight > 0) {
                        let [scroll_x, scroll_y] = this.calculate_scroll_xy(store.drawing.pixel.x, store.drawing.pixel.y, store.drawing.scale);

                        /* set new scroll position */
                        this.$refs.canvas_container.scrollLeft = scroll_x;
                        this.$refs.canvas_container.scrollTop = scroll_y;

                        this.center_camera = false; // reset flag
                    }
                }
            }
            
            requestAnimationFrame(this.handle_canvas); // keep itself running
        },

        handle_canvas_click(event) {
            // console.log(event.offsetX);
            // console.log(event.offsetY);
            if(!store.user.moderator && store.canvas.readonly) return; // read-only
            let x = event.offsetX; if(x < 0) x = 0;
            let y = event.offsetY; if(y < 0) y = 0;
            store.drawing.pixel.x = Math.floor(x / store.drawing.scale);
            store.drawing.pixel.y = Math.floor(y / store.drawing.scale);
            store.drawing.pixel.selected = true;
            // this.place_pixel();
            // store.drawing.pixel.selected = true;
            // console.log([this.pointer_x, this.pointer_y]);
        },

        calculate_scroll_xy(center_x, center_y, scale) {
            let container = this.$refs.canvas_container;

            /* work back to expected camera position under new scale */
            let scroll_x = center_x * scale - container.clientWidth / 2;
            let scroll_y = center_y * scale - container.clientHeight / 2;

            /* perform bounds checking */
            if(scroll_x < 0) scroll_x = 0;
            else if(scroll_x > this.canvas_width - container.clientWidth) scroll_x = this.canvas_width - container.clientWidth;
            if(scroll_y < 0) scroll_y = 0;
            else if(scroll_y > this.canvas_height - container.clientHeight) scroll_y = this.canvas_height - container.clientHeight;
            
            return [scroll_x, scroll_y];
        },

        handle_scale_change(new_scale, old_scale) {
            if(!this.min_scale_calculated) {
                this.min_scale_calculated = true;
                return;
            }
            // console.log(new_scale, old_scale);
            
            /* calculate camera center point location (pixel) */
            let container = this.$refs.canvas_container;
            let center_x = (container.scrollLeft + container.clientWidth / 2) / old_scale;
            let center_y = (container.scrollTop + container.clientHeight / 2) / old_scale;
            // console.log(center_x, center_y);

            let [scroll_x, scroll_y] = this.calculate_scroll_xy(center_x, center_y, new_scale);

            /* set new scroll position */
            container.scrollLeft = scroll_x;
            container.scrollTop = scroll_y;
        },

        download_canvas() {
            let canvas = document.getElementById('canvas');
            if(canvas !== null) {
                var link = document.createElement('a');
                link.download = 'canvas.png';
                link.href = canvas.toDataURL();
                link.click();
            }
        },      

        logio_resize() {
            if(getComputedStyle(document.querySelector('.actions')).flexDirection == 'column') {
                setInterval(() => {
                    this.handle_resize();
                }, 10); // allow some time for the UI to update before requesting resize
            }
        },
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
        },

        rem_to_px() {
            return parseFloat(getComputedStyle(document.documentElement).fontSize);
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
    background: url('../assets/icons/wait.webp');
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 15rem auto;
    image-rendering: pixelated;
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

.nodisp {
    display: none;
}
</style>