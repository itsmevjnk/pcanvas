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
        default: '0.5rem'
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
    <div class="vscroll-container">
        <button @mousedown.left="handle_dec" @mouseup="clear_dec">
            <i class="arrow-up"></i>
        </button>
        <div class="bar-container bg-checker">
            <div class="scroll-bar" ref="scroll_bar" :style="{
                height: 'calc(100% - ' + max + '*' + props.scale + ')',
                top: 'calc(' + props.modelValue + '*' + props.scale + ')',
                'min-height': props.scale // sneaky one so we can get the scale in pixels
            }"
            @mousedown.left="mouse_down = true" @mouseup="mouse_down = false" @mouseleave="mouse_down = false"
            @mousemove="handle_mouse_move" @mouseenter="handle_mouse_enter"></div>
        </div>
        <button @mousedown.left="handle_inc" @mouseup="clear_inc">
            <i class="arrow-down"></i>
        </button>
    </div>
</template>

<script>
export default {
    name: 'VertScrollBar',

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
            if(!this.mouse_down) { // TODO: may be redundant
                if(event.buttons & 1) this.mouse_down = true;
            }
        },

        handle_mouse_move(event) {
            if(this.mouse_down) {
                /* only change value if the scroll bar is clicked */
                let new_value = this.modelValue + event.movementY / this.scale_px;
                if(new_value < 0) new_value = 0;
                else if(new_value > this.max_num) new_value = this.max_num;
                this.emit_model(new_value);                
            }
        },

        handle_dec() {
            if(this.modelValue > 0 && this.dec_timeout === null) {
                let new_value = this.modelValue - this.istep_num;
                if(new_value < 0) new_value = 0;
                this.emit_model(new_value);

                if(new_value > 0) this.dec_timeout = setTimeout(this.handle_dec_rep, this.rdelay_num);
            }
        },

        handle_dec_rep() {
            if(this.modelValue > 0) {
                let new_value = this.modelValue - this.rstep_num;
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
            if(this.modelValue < this.max_num && this.inc_timeout === null) {
                let new_value = this.modelValue + this.istep_num;
                if(new_value > this.max_num) new_value = this.max_num;
                this.emit_model(new_value);

                if(new_value < this.max_num) this.inc_timeout = setTimeout(this.handle_inc_rep, this.rdelay_num);
            }
        },

        handle_inc_rep() {
            if(this.modelValue < this.max_num) {
                let new_value = this.modelValue + this.rstep_num;
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
            return parseFloat(getComputedStyle(this.$refs.scroll_bar).minHeight);
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
    padding: 0.15rem 0.325rem;
    width: initial;
}
</style>