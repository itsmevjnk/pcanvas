<script setup>
import TitleBar from '../components/TitleBar.vue'
import GenericMenuBar from '../components/GenericMenuBar.vue'
import { RouterLink } from 'vue-router'

import { store } from '../store.js'
import { maps } from '../maps.js'
</script>

<template>
    <TitleBar title="About pCanvas"/>
    <GenericMenuBar/>
    <main>
        <div class="msg-container">
            <img class="icon pixel" src="../assets/ui/icons/info.png" v-no-ctx-menu>
            <div class="content">
                <p>
                    <b>Developed by:</b><br>
                    Thanh Vinh Nguyen (itsmevjnk)<br>
                    Deakin University, Melbourne Burwood Campus<br>
                    GitHub: <a href="https://github.com/itsmevjnk" target="_blank">https://github.com/itsmevjnk</a><br>
                    Email: <a href="mailto:s223145883@deakin.edu.au">s223145883@deakin.edu.au</a>
                </p>
                <div id="gmaps"></div>
                <p>
                    Written in HTML, CSS and JS (Vue 3) for the SIT120 2.2C and 3.1D tasks.<br>
                    Backend written in JS (NodeJS + Express) as part of the SIT120 3.1D task.
                </p>
                <p>
                    Microsoft&reg; and Windows&reg; are either registered trademarks or trademarks of Microsoft Corporation in the United States and/or other countries.
                </p>
            </div>
        </div>
    </main>
    <footer>
        <RouterLink to="/" class="button" v-focus>OK</RouterLink>
    </footer>
</template>

<script>
export default {
    mounted() {
        let gmaps_script_setup = document.createElement('script');
        gmaps_script_setup.innerHTML =  "function map_setup(){" + // NOTE: very hacky!
                                        "var center=new google.maps.LatLng(" + maps.center.lat + "," + maps.center.lng + ");" +
                                        "var map=new google.maps.Map(document.getElementById('gmaps'),{" + 
                                        "center:center," + 
                                        "panControl:true," +
                                        "zoomControl:true," +
                                        "mapTypeControl:false," +
                                        "scaleControl:false," +
                                        "streetViewControl:false," +
                                        "overviewMapControl:false," +
                                        "rotateControl:true," +
                                        "zoom:" + maps.zoom + 
                                        "});" + 
                                        "var marker=new google.maps.Marker({" + 
                                        "position:center" +
                                        "});" +  
                                        "marker.setMap(map);" + 
                                        "}";
        let gmaps_script_incl = document.createElement('script');
        gmaps_script_incl.setAttribute('id', 'gmaps-api-incl');
        gmaps_script_incl.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + maps.api + '&callback=map_setup');
        
        document.body.appendChild(gmaps_script_setup);
        document.body.appendChild(gmaps_script_incl);
    }
};
</script>

<style scoped>
footer, main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem 0;
}

#gmaps {
    width: 100%;
    height: 25dvh;
}
</style>