<template v-if="isLoaded">
    <!--Need to think about why isLoaded on template all works but not in map-container-->
    <div class="map-container">
        <div id="map"></div>
        <div class="input-group mb-3 mt-3 px-3">
            <input type="text" class="form-control" placeholder="Apdzivotas vietas nosaukums" v-model="searchText">
            <div class="input-group-append ">
                <button class="btn btn-primary" type="button" @click="popupOnMap">
                    Meklēšanas rezultāts
                    <span class="badge badge-light">{{ filteredLivingPlaces?.length ?? 'NAV' }}</span>
                </button>
                <button class="btn btn-info" type="button" @click="revert">
                    Atiestatīt visu
                </button>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, onMounted, computed } from 'vue';
import L from 'Leaflet';
import CONSTANT from '../constants';
import livingPlaceService from '../services/living-place-service';

let mapHandler;
let defaultLivingPlaces = [];
let cornerLivingPlaces = [];
let cornerLivingPlacesMarkers = [];
let filteredLivingPlacesMarkers = [];
const searchText = ref('');
const isLoaded = ref(false);

onMounted(async () => {
    mapHandler = L.map('map');
    setDefaultView();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapHandler);

    defaultLivingPlaces = await livingPlaceService.getLivingPlaces();

    let southeastLivingPlace = defaultLivingPlaces[0];
    let northeastLivingPlace = defaultLivingPlaces[0];
    let easternLivingPlace = defaultLivingPlaces[0];
    let westernLivingPlace = defaultLivingPlaces[0];

    for (const place of defaultLivingPlaces) {
        if (westernLivingPlace.DD_E > place.DD_E)
            westernLivingPlace = place;

        if (easternLivingPlace.DD_E < place.DD_E)
            easternLivingPlace = place;

        if (southeastLivingPlace.DD_N > place.DD_N)
            southeastLivingPlace = place;

        if (northeastLivingPlace.DD_N < place.DD_N)
            northeastLivingPlace = place;
    }

    cornerLivingPlaces = [
        { ...northeastLivingPlace, PUSE: 'Ziemeļi' },
        { ...easternLivingPlace, PUSE: 'Austrumi' },
        { ...southeastLivingPlace, PUSE: 'Dienvidi' },
        { ...westernLivingPlace, PUSE: 'Rietumi' }
    ];

    placeCornerLivingPlacesOnMap();

    isLoaded.value = true;
});

const filteredLivingPlaces = computed(() => {
    if (searchText.value) {
        return defaultLivingPlaces?.filter((place) => {
            return place.NOSAUKUMS && place.NOSAUKUMS.toLowerCase().includes(searchText.value.toLowerCase());
        });
    }

    return defaultLivingPlaces;
})

function setDefaultView() {
    mapHandler.setView([CONSTANT.DEFAULT_VIEW.LATITUDE, CONSTANT.DEFAULT_VIEW.LONGITUDE], CONSTANT.DEFAULT_VIEW.ZOOM);
};

function placeCornerLivingPlacesOnMap() {
    for (const place of cornerLivingPlaces) {
        const marker = L.marker([place.DD_N, place.DD_E]).addTo(mapHandler)
            .bindPopup(`Tālākais apdzīvotais punkts uz ${place.PUSE}em.<br>Apdz vietas nosaukums: ${place.NOSAUKUMS}.`)
            .openPopup();

        cornerLivingPlacesMarkers.push(marker);
    };
}
// TODO: make some logic if user presses same button twice to not redraw everything
// Probably flag to check if cornerLivingPlacesMarkers are already removed
// watcher what watches searchText variable if it changes set to true flag to remove filteredLivingPlacesMarkers from map
function popupOnMap() {
    if (!filteredLivingPlaces.value)
        return;

    for (const placePopup of cornerLivingPlacesMarkers)
        mapHandler.removeLayer(placePopup);

    removeFilteredLivingPlacesMarkers();

    const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    for (const place of filteredLivingPlaces.value) {
        const marker = L.marker([place.DD_N, place.DD_E], { icon: greenIcon }).addTo(mapHandler)
            .bindPopup(`Rezultāts .<br>Apdz vietas nosaukums: ${place.NOSAUKUMS}.`)
            .openPopup();

        filteredLivingPlacesMarkers.push(marker);
    }
}

function revert() {
    setDefaultView();
    placeCornerLivingPlacesOnMap();
    removeFilteredLivingPlacesMarkers();
}

function removeFilteredLivingPlacesMarkers() {
    for (const placePopup of filteredLivingPlacesMarkers)
        mapHandler.removeLayer(placePopup);
}

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