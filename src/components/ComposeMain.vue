<template v-if="isLoaded">
<!--Need to think about why isLoaded on template all works but not in map-container-->
    <div class="map-container">
        <div id="map"></div>
        <div class="input-group mb-3 mt-3 px-3">
            <input type="text" class="form-control" placeholder="Apdzivotas vietas nosaukums" v-model="searchText">
            <div class="input-group-append ">
                <button class="btn btn-primary"  type="button">
                    Meklēt
                    {{ defaultLivingPlaces?.length ?? 'Nope' }}
                    asdfsa
                </button>
                <button class="btn btn-success"  type="button">
                    Zoom rezultātu
                    {{  isLoaded }}
                </button>
                <button class="btn btn-info"  type="button">
                    Atiestatīt visu
                </button>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue';
import L from 'Leaflet';
import CONSTANT from '../constants';
import livingPlaceService from '../services/living-place-service';

let mapHandler; // Probably should be ref. Because its time to time changes
let defaultLivingPlaces = ref([]);
const searchText = ref('');
const isLoaded = ref(false);

onMounted(async () => {
    mapHandler = L.map('map');
    setDefaultView();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapHandler);

    defaultLivingPlaces = await livingPlaceService.getLivingPlaces();
    isLoaded.value = true;
});

function setDefaultView() {
    mapHandler.setView([CONSTANT.DEFAULT_VIEW.LATITUDE, CONSTANT.DEFAULT_VIEW.LONGITUDE], CONSTANT.DEFAULT_VIEW.ZOOM);
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