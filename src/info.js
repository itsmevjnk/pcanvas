import {reactive} from 'vue';

export const store = reactive({
    canvas: {
        width: 1024,
        height: 1024
    },

    color_board: {
        top: [0, 8, 1, 3, 2, 6, 4, 5],
        bottom: [15, 7, 9, 11, 10, 14, 12, 13]
    }
});