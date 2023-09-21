import axios from "axios";
import { socket } from './socket.js'
import { store } from "./store.js";

export function handle_ws_place(payload) {
    let x = payload.offset % store.canvas.width, y = Math.floor(payload.offset / store.canvas.width);
    // console.log('WS place event @', x, y);
    store.canvas.contents[y][x] = payload.color;
    store.canvas.update.push([x, y]);
}

export function load_canvas(callback) {
    store.canvas.ready = false;

    store.canvas.contents = Array(store.canvas.height).fill().map(() => Array(store.canvas.width).fill(15));
    axios.get(store.api + '/canvas/' + store.canvas.id + '/fetch').then((f_resp) => {
        /* populate pixels */
        f_resp.data.payload.forEach((pixel) => {
            // console.log(pixel);
            let x = pixel.offset % store.canvas.width;
            let y = Math.floor(pixel.offset / store.canvas.width);
            store.canvas.contents[y][x] = pixel.color;
        });
        store.canvas.redraw = true;

        axios.get(store.api + '/canvas/' + store.canvas.id + '/cooldown', { withCredentials: true }).then((c_resp) => {
            /* get cooldown timer */
            // console.log(c_resp.data);
            store.drawing.cooldown = c_resp.data.payload.timer;
        }).catch((err) => {
            // TODO: do something?
        }).finally(() => {
            /* set up WebSocket */
            socket.on('place', handle_ws_place);
            socket.emit('subscribe', store.canvas.id);
            
            store.canvas.ready = true;

            if(callback !== undefined) callback();
        });
    });
}