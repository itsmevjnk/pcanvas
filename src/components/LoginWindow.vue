<script setup>
import Window from './Window.vue';
import { disable_ctx_menu_all } from '../utils.js';
import axios from 'axios';
import { store } from '../info';

const props = defineProps({
    z_index: {
        type: [String, Number],
        default: 3
    }
});

const emits = defineEmits(['cancel', 'done'])
</script>

<template>
    <Window title="Log in" moveable="false" :z_index="z_index_num">
        <div class="outer">
            <div class="prompt">
                <div class="row">
                    <img src="../assets/ui/icons/network.png" class="icon pixel no-ctx-menu"/>
                    <div class="prompt-text">
                        Enter your user name and password to start drawing.
                    </div>
                </div>
                <div class="row">
                    <img src="../assets/ui/icons/network.png" class="icon pixel invisible"/>
                    <div class="prompt-text">
                        <div class="field">
                            <label for="user">User name:</label>
                            <input name="user" type="text" v-model="user" class="no-focus" :disabled="input_disable">
                        </div>
                        <div class="field">
                            <label for="password">Password:</label>
                            <input name="password" type="password" v-model="password" class="no-focus" :disabled="input_disable">
                        </div>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <button @click="submit" :disabled="input_disable">OK</button>
                <button @click="$emit('cancel')" :disabled="input_disable">Cancel</button>
                <button :disabled="input_disable">Register</button>
            </div>
        </div>
    </Window>
    <Window title="Error" :z_index="z_index_num + 1" v-if="error !== null">
        <div class="msg-container">
            <img class="icon pixel no-ctx-menu" src="../assets/ui/icons/error.png">
            <div class="content">
                {{ error }}
            </div>
        </div>
        <div class="button-group">
            <button @click="input_disable = false; error = null;">OK</button>
        </div>
    </Window>
</template>

<script>
export default {
    name: 'LoginWindow',

    data() {
        return {
            user: '',
            password: '',
            error: null,
            input_disable: false
        };
    },

    mounted() {
        disable_ctx_menu_all();
    },

    methods: {
        submit() {
            this.input_disable = true;
            axios.put(store.api + '/auth/login', {
                user: this.user,
                password: this.password
            }).then((resp) => {
                /* login successful */
                store.user.name = resp.data.payload.user;
                store.user.moderator = resp.data.payload.moderator;
                this.$cookies.set('id', resp.data.payload.id);
                this.$cookies.set('token', resp.data.payload.token);
                this.input_disable = false;
                this.$emit('done');
            }).catch((error) => {
                if(error.response) {
                    if(error.response.status == 400)
                        this.error = 'Invalid user name or password.';
                    else
                        this.error = 'Server error:\n' + resp.data.message;
                }
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
.row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
}

.prompt-text {
    padding: 0 1.5rem;
    width: 100%;
}

.prompt {
    display: flex;
    flex-direction: column;
}

.outer {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 1rem 1.5rem;
}

.icon {
    flex: 0;
    min-width: 4rem;
    height: auto;
}

button:not(:first-child),
button:not(:first-child):active {
    margin-top: 0.25rem;
}

.invisible {
    visibility: hidden;
}

.field {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
}

.field:not(:first-child) {
    margin-top: 0.25rem;
}

label {
    display: block;
    flex-basis: 6rem;
    flex-shrink: 0;
    flex-grow: 0;
}

.field input {
    flex: 1;
}

@media screen and (max-width: 825px) {
    button:not(:first-child) {
        margin-top: 0;
    }

    .buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        margin-top: 1rem;
    }

    .outer {
        flex-direction: column;
        align-items: center;
    }
}

.msg-container .content {
    white-space: pre;
}



.msg-container {
    margin-bottom: 0.5rem;
}

.button-group {
    margin-bottom: 1rem;
}
</style>