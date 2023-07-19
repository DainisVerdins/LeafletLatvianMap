<template>
    <div class="map-container">
        <div id="map"></div>
        <div class="input-group mb-3 mt-3 px-3">
            <input type="text" class="form-control" placeholder="Apdzivotas vietas nosaukums" v-model="searchText">
            <div class="input-group-append ">
                <button class="btn btn-primary" @click="searchPlaces" type="button">
                    Meklēt
                </button>
                <button class="btn btn-success" @click="zoomToPlace" type="button" :disabled="haveSearchResults()">
                    Zoom rezultātu
                </button>
                <button class="btn btn-info" @click="toDefaults" type="button">
                    Atiestatīt visu
                </button>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { onMounted } from 'vue';
import L from 'Leaflet';
import CONSTANT from '../constants';

const mapHandler = L.map('map'); // Probably should be ref. Because its time to time changes

onMounted(async () => {
    setDefaultView();
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapHandler);
});

function setDefaultView() {
    mapHandle.setView([CONSTANT.DEFAULT_VIEW.LATITUDE, CONSTANT.DEFAULT_VIEW.LONGITUDE], CONSTANT.DEFAULT_VIEW.ZOOM);
};

</script>
<style scoped>
.map-container {
    margin: 20px;
    border: 20px solid red;
    border-radius: 5px;
}

.input-container {
    margin-top: 10px;
}

#map {
    width: 1024px;
    /*make them constants? */
    height: 576px;
}
</style>