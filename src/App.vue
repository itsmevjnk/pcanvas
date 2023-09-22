<script setup>
import { RouterView } from 'vue-router'
import { store } from './store';
</script>

<template>
    <div class="w9x" id="main-window">
        <RouterView v-slot="{ Component }">
            <KeepAlive>
                <component :is="Component"/>
            </KeepAlive>
        </RouterView>
    </div>
    <div class="w9x" id="website-footer">
        <div class="text">
            {{ store.footer.text }}
        </div>
        <div class="stat-bar">
            <a :href="store.footer.github" target="_blank">
                <img src="./assets/icons/github.png">
            </a>
            <a :href="'mailto:' + store.footer.email">
                <img src="./assets/icons/mailbox_world-1.png">
            </a>
            <div id="clock">
                {{ time }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            time: '--:-- AM'
        };
    },

    mounted() {
        this.update_time();
        setInterval(this.update_time, 1000);
    },

    methods: {
        update_time() {
            const d = new Date();
            let hr = d.getHours(), min = d.getMinutes();

            /* convert 24 hour to 12 hour */
            let hr_12 = (hr % 12 == 0) ? 12 : (hr % 12);
            let am_pm = (hr >= 12 && hr <= 23) ? 'PM' : 'AM';

            this.time = hr_12 + ':' + String(min).padStart(2, '0') + ' ' + am_pm;
        }
    }
};
</script>

<style scoped>
#main-window {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    box-sizing: border-box;
    max-height: calc(100dvh - 2rem);
}

#website-footer {
    flex: 0;
    box-sizing: border-box;
    min-height: 2rem;
    padding: 0.5rem 0.75rem;
    display: flex;
    flex-direction: row;
}

#website-footer .text {
    flex: 1;
}

#website-footer .stat-bar {
    flex: 0;
    display: flex;
    flex-direction: row;
}

#website-footer a:not(:last-child) img {
    margin-right: 0.4rem;
}

#clock {
    width: 4rem;
    text-align: end;
}

@media screen and (max-width: 825px) {
    #main-window {
        max-height: calc(100dvh - 4rem);
    }

    #website-footer {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 4rem;
    }
}
</style>