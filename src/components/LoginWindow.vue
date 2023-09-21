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
    <Window :title="(register) ? 'Register' : 'Log in'" moveable="false" :z_index="z_index_num">
        <div class="outer">
            <div class="prompt">
                <div class="row">
                    <img src="../assets/ui/icons/network.png" class="icon pixel" v-no-ctx-menu/>
                    <div class="prompt-text">
                        Enter your user name and password to start drawing.
                    </div>
                </div>
                <div class="row">
                    <img src="../assets/ui/icons/network.png" class="icon pixel invisible"/>
                    <div class="prompt-text">
                        <div class="field">
                            <label for="user" v-if="!register">User name/Email:</label>
                            <label for="user" v-else>User name:</label>
                            <input name="user" type="text" v-model="user" class="no-focus" :disabled="input_disable">
                        </div>
                        <div class="field" v-if="register">
                            <label for="email">Email address:</label>
                            <input name="email" type="text" v-model="email" class="no-focus" :disabled="input_disable">
                        </div>
                        <div class="field">
                            <label for="password">Password:</label>
                            <input name="password" type="password" v-model="password" class="no-focus" :disabled="input_disable">
                        </div>
                        <div class="field" v-if="register">
                            <label for="password_confirm">Confirm password:</label>
                            <input name="password_confirm" type="password" v-model="password_confirm" class="no-focus" :disabled="input_disable">
                        </div>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <button @click="submit" :disabled="input_disable" v-focus>OK</button>
                <button @click="$emit('cancel')" :disabled="input_disable">Cancel</button>
                <button @click="register = true; email = ''; password_confirm = '';" :disabled="input_disable" v-if="!register">Register</button>
                <button @click="register = false;" :disabled="input_disable" v-else>Log in</button>
            </div>
        </div>
    </Window>
    <Window title="Error" :z_index="z_index_num + 1" v-if="error !== null">
        <div class="msg-container">
            <img class="icon pixel" src="../assets/ui/icons/error.png" v-no-ctx-menu>
            <div class="content">
                <div>{{ error }}</div>
                <ul v-if="error_list.length > 0">
                    <li v-for="msg in error_list">{{ msg }}</li>
                </ul>
            </div>
        </div>
        <div class="button-group">
            <button @click="input_disable = false; error = null;">OK</button>
        </div>
    </Window>
    <Window title="Success" :z_index="z_index_num + 1" v-if="register_success">
        <div class="msg-container">
            <img class="icon pixel" src="../assets/ui/icons/info.png" v-no-ctx-menu>
            <div class="content">
                Registration complete. You can now sign in using these credentials:
                <ul>
                    <li>User name: {{ this.user }}</li>
                    <li>Email address: {{ this.email }}</li>
                    <li>Password: (as supplied)</li>
                </ul>
                Happy drawing!
            </div>
        </div>
        <div class="button-group">
            <button @click="input_disable = false; $emit('done');">OK</button>
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
            error_list: [],
            input_disable: false,

            register: false,
            email: '',
            password_confirm: '',
            register_success: false
        };
    },

    methods: {
        raise_error_list() {
            this.error = (this.error_list.length > 0) ? 'One or more error(s) have been found below.\nPlease correct them before trying again:' : null;
        },

        submit() {
            this.input_disable = true;
            if(this.register) {
                /* register */

                /* client side input validation */
                if(this.user == '' || this.email == '' || this.password == '' || this.password_confirm == '')
                    this.error_list.push('All input fields must be filled.');
                if(this.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) == null)
                    this.error_list.push('Email address is not valid.');
                if(this.password != '' && this.password.length < store.user.min_pw_length)
                    this.error_list.push('Password must be at least ' + store.user.min_pw_length + ' characters in length.');
                if(this.password_confirm != this.password)
                    this.error_list.push('Password confirmation field does not match.');
                
                if(this.error_list.length == 0) {
                    /* contact API if input is validated */
                    axios.get(import.meta.env.VITE_API_URL + '/auth/exists?user=' + this.user + '&email=' + this.email).then((chk_resp) => {
                        if(chk_resp.data.payload.user)
                            this.error_list.push('An user with the specified name already exists.');
                        if(chk_resp.data.payload.email)
                            this.error_list.push('An user with the specified email address already exists.');
                        if(this.error_list.length > 0)
                            this.raise_error_list();
                        else
                            axios.post(import.meta.env.VITE_API_URL + '/auth/register', {
                                user: this.user,
                                password: this.password,
                                email: this.email
                            }).then((reg_resp) => {
                                store.user.name = reg_resp.data.payload.user;
                                store.user.moderator = reg_resp.data.payload.moderator;
                                this.$cookies.set('id', reg_resp.data.payload.id);
                                this.$cookies.set('token', reg_resp.data.payload.token);
                                this.register_success = true;
                            });
                    })
                } else this.raise_error_list();
            } else {
                /* log in */
                // console.log('logging in');
                if(this.user == '' || this.password == '')
                    this.error = 'Please enter an user name (or email address) and a password.';
                else axios.put(import.meta.env.VITE_API_URL + '/auth/login', {
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
                        if(error.response.status == 403)
                            this.error = 'Invalid user name or password.';
                        else
                            this.error = 'Server error:\n' + error.response.data.message;
                    }
                });
            }
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
    flex-basis: 8rem;
    flex-shrink: 0;
    flex-grow: 0;
}

.field input {
    flex: 1;
    min-width: 50%;
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
    white-space: pre-wrap;
}

.msg-container {
    margin-bottom: 0.5rem;
}

.button-group {
    margin-bottom: 1rem;
}
</style>