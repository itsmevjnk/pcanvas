<script setup>
import Window from './Window.vue';
import { disable_ctx_menu_all } from '../utils.js';

const props = defineProps({
    z_index: {
        type: [String, Number],
        default: 3
    }
});

const emits = defineEmits(['cancel'])
</script>

<template>
    <Window title="Log in" moveable="false">
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
                            <input name="user" type="text" v-model="user" class="no-focus">
                        </div>
                        <div class="field">
                            <label for="password">Password:</label>
                            <input name="password" type="password" v-model="password" class="no-focus">
                        </div>
                    </div>
                </div>
            </div>
            <div class="buttons">
                <button @click="submit">OK</button>
                <button @click="$emit('cancel')">Cancel</button>
                <button>Register</button>
            </div>
        </div>
    </Window>
</template>

<script>
export default {
    name: 'LoginWindow',

    data() {
        return {
            user: '',
            password: ''
        };
    },

    mounted() {
        disable_ctx_menu_all();
    },

    methods: {
        submit() {

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
</style>