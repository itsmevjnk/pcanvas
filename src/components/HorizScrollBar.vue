<script setup>
import {ref} from 'vue';

const scroll_bar = ref(null);

const props = defineProps({
    modelValue: Number,
    max: {
        type: [Number, String]
    },
    scale: {
        type: String,
        default: '10rem'
    },
    init_step: { // divided by max
        type: [Number, String],
        default: 0.6
    },
    rep_delay: {
        type: [Number, String],
        default: 500
    },
    rep_rate: {
        type: [Number, String],
        default: 100
    },
    rep_step: { // divided by max
        type: [Number, String],
        default: 0.3
    }
});

const emits = defineEmits(['update:modelValue']);
</script>

<template>
    <div class="hscroll-container">
        <button @mousedown.left="handle_dec" @mouseup="clear_dec">
            <i class="arrow-left"></i>
        </button>
        <div class="bar-container bg-checker">
            <div class="scroll-bar" ref="scroll_bar" :style="{
                width: 'calc(100% - ' + props.max + '*' + props.scale + ')',
                left: (max_num !== 0) ? ('calc(' + props.modelValue + '*' + props.scale + ')') : '0px',
                'min-width': props.scale, // sneaky one so we can get the scale in pixels
                // 'max-height': props.max + 'px'
            }"
            @mousedown.left="mouse_down = true" @mouseup="mouse_down = false" @mouseleave="mouse_down = false"
            @mousemove="handle_mouse_move" @mouseenter="handle_mouse_enter"></div>
        </div>
        <button @mousedown.left="handle_inc" @mouseup="clear_inc">
            <i class="arrow-right"></i>
        </button>
    </div>
</template>

<script>
export default {
    name: 'HorizScrollBar',

    data() {
        return {
            mouse_down: false,
            dec_timeout: null,
            inc_timeout: null
        }
    },

    methods: {
        /* TODO: allow cursor to be moved out briefly after clicking */

        emit_model(val) {
            this.$emit('update:modelValue', val);  
        },

        handle_mouse_enter(event) {
            if(this.max_num === 0) return;
            if(!this.mouse_down) { // TODO: may be redundant
                if(event.buttons & 1) this.mouse_down = true;
            }
        },

        handle_mouse_move(event) {
            if(this.max_num === 0) return;
            if(this.mouse_down) {
                /* only change value if the scroll bar is clicked */
                let new_value = this.model_num + event.movementX / this.scale_px;
                if(new_value < 0) new_value = 0;
                else if(new_value > this.max_num) new_value = this.max_num;
                this.emit_model(new_value);
                // console.log(new_value);                
            }
        },

        handle_dec() {
            if(this.max_num === 0) return;
            if(this.model_num > 0 && this.dec_timeout === null) {
                let new_value = this.model_num - this.istep_num;
                if(new_value < 0) new_value = 0;
                this.emit_model(new_value);

                if(new_value > 0) this.dec_timeout = setTimeout(this.handle_dec_rep, this.rdelay_num);
            }
        },

        handle_dec_rep() {
            if(this.model_num > 0) {
                let new_value = this.model_num - this.rstep_num;
                if(new_value < 0) new_value = 0;
                this.emit_model(new_value);

                if(new_value > 0) this.dec_timeout = setTimeout(this.handle_dec_rep, this.rstep_num);
            }
        },

        clear_dec() {
            if(this.dec_timeout !== null) {
                clearTimeout(this.dec_timeout);
                this.dec_timeout = null;
            }
        },

        handle_inc() {
            if(this.max_num === 0) return;
            if(this.model_num < this.max_num && this.inc_timeout === null) {
                let new_value = this.model_num + this.istep_num;
                if(new_value > this.max_num) new_value = this.max_num;
                this.emit_model(new_value);

                if(new_value < this.max_num) this.inc_timeout = setTimeout(this.handle_inc_rep, this.rdelay_num);
            }
        },

        handle_inc_rep() {
            if(this.model_num < this.max_num) {
                let new_value = this.model_num + this.rstep_num;
                if(new_value > this.max_num) new_value = this.max_num;
                this.emit_model(new_value);

                if(new_value < this.max_num) this.inc_timeout = setTimeout(this.handle_inc_rep, this.rstep_num);
            }
        },

        clear_inc() {
            if(this.inc_timeout !== null) {
                clearTimeout(this.inc_timeout);
                this.inc_timeout = null;
            }
        }
    },

    computed: {
        scale_px() {
            return parseFloat(getComputedStyle(this.$refs.scroll_bar).minWidth);
        },

        model_num() {
            return parseFloat(this.modelValue);
        },

        max_num() {
            return parseFloat(this.max);
        },

        istep_num() {
            return parseFloat(this.init_step);
        },

        rdelay_num() {
            return parseFloat(this.rep_delay);
        },

        rrate_num() {
            return parseFloat(this.rep_rate);
        },

        rstep_num() {
            return parseFloat(this.rep_step);
        }
    }
};
</script>

<style scoped>
.scroll-bar {
    position: relative;
}

button {
    padding: 0.2rem 0.5rem;
    width: initial;
}

</style>