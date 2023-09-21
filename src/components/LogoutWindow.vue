<script setup>
import Window from './Window.vue';
import axios from 'axios';
import { store } from '../store.js';

const props = defineProps({
    z_index: {
        type: [String, Number],
        default: 3
    }
});

const emits = defineEmits(['cancel', 'done']);
</script>

<template>
    <Window title="Log Out pCanvas" blocking="blocking-bg" :z_index="z_index_num" close="true" @close="$emit('cancel')">
        <div class="msg-container">
            <img class="icon pixel" src="../assets/ui/icons/key.png" v-no-ctx-menu>
            <div class="content">
                Are you sure you want to log out?
            </div>
        </div>
        <div class="button-group">
            <button @click="logout">Yes</button>
            <button @click="$emit('cancel')" v-focus>No</button>
        </div>
    </Window>
</template>

<script>
export default {
    name: 'LogoutWindow',

    data() {
        return {

        };
    },

    methods: {
        logout() {
            axios.delete(store.api + '/auth/logout', { withCredentials: true }).then((resp) => {
                // nothing much to do here
            }).catch((err) => {
                // nothing much to do here either
            }).finally(() => {
                store.user.name = '';
                this.$cookies.remove('id');
                this.$cookies.remove('token');
                this.$emit('done');
            });
        }
    },

    computed: {
        z_index_num() {
            return parseFloat(this.z_index);
        }
    }
};
</script>

<style scoped>
.button-group {
    margin-bottom: 1rem;
}
</style>