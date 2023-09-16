import {reactive} from 'vue';

export const store = reactive({
    canvas: {
        width: 1024,
        height: 1024,
        id: NaN,
        name: ''        
    },

    drawing: {
        pixel: {
            selected: false,
            x: 0,
            y: 0
        },
        color: 0,
        cooldown: 0,

        /* canvas stuff */
        scale: 1,
        scale_min: 1,
        scale_min_min: 8,
        scale_max: 100
    },

    color_board: {
        top: [0, 8, 1, 3, 2, 6, 4, 5],
        bottom: [15, 7, 9, 11, 10, 14, 12, 13]
    },

    user: {
        name: '',
        moderator: false,

        min_pw_length: 8
    },

    admin_email: 's223145883@deakin.edu.au',

    tutorial_video: '3Q9hGfqx32w', // must only contain video ID!

    api: 'http://localhost:8000'
});