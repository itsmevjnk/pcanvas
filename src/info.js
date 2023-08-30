import {reactive} from 'vue';

export const store = reactive({
    canvas: {
        width: 1024,
        height: 1024        
    },

    drawing: {
        pixel: {
            selected: true,
            x: 0,
            y: 0
        },
        color: 0,
        cooldown: false,
        scale: 1
    },

    color_board: {
        top: [0, 8, 1, 3, 2, 6, 4, 5],
        bottom: [15, 7, 9, 11, 10, 14, 12, 13]
    },

    user: {
        name: '',
        id: 0
    },

    admin_email: 's223145883@deakin.edu.au'
});