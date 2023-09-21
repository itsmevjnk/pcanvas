import { reactive } from 'vue';
import { io } from 'socket.io-client';
import { store } from './store.js';

export const socket_state = reactive({
    connected: false
});

export const socket = io(import.meta.env.VITE_API_URL);

socket.on('connect', () => {
    socket_state.connected = true;
});

socket.on('disconnect', () => {
    socket.state.connected = false;
});