<template>
  <div class="map-container">
    <div id="map"></div>
    <div class="input-group mb-3 mt-3 px-3">
      <input
        type="text"
        class="form-control"
        placeholder="Apdzivotas vietas nosaukums"
        v-model="searchText"
      >
      <div class="input-group-append ">
        <button
          class="btn btn-primary"
          @click="searchPlaces"
          type="button"
          >
            Meklēt
        </button>
        <button 
          class="btn btn-success"
          @click="zoomToPlace"
          type="button"
          :disabled="haveSearchResults()"
          >
            Zoom rezultātu
          </button>
        <button
          class="btn btn-info"
          @click="toDefaults"
          type="button"
        >
          Atiestatīt visu
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'Leaflet';
import * as csv from 'jquery-csv';
import CONSTANT from '../constants'

export default {
  data: () => ({
    map: null,
    defaultPlaces: null,
    searchText: null,
    residentialPlacesReflectedOnMapMarkers: [],
    residentialPlacesReflectedOnMap: [],

    /* Record of living Place
      {
        DD_E : Number,
        DD_N : Number,
        KODS : Number,
        KOORD_X : Number,
        KOORD_Y: number,
        NOSAUKUMS: String,
        STD : string,
        TIPS_CD : string,
        VKUR_CD : number
        VKUR_TIPS : number
      }
    */
  }),

  async mounted() {
    await this.init();
  },

  methods: {
    async init() {
      this.mapHandler = L.map('map');
      this.setDefaultView();

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.mapHandler);

      await this.initDefaultPlaces();

      this.placeCornerResidentPlacesOnMap();
    },

    async initDefaultPlaces() {
      const response = await fetch(`${CONSTANT.CSV_FILE.PATH}/${CONSTANT.CSV_FILE.FILE_NAME}`);
      const rawCSV = await response.text();
      /*
        According wikipedia living places are vilages, cities, 
        https://lv.wikipedia.org/wiki/Apdzīvota_vieta
        So filtering to only contain living places
        Non Living spaces have 2 and more words in it
      */
      this.defaultPlaces = await csv.toObjects(rawCSV, { separator: CONSTANT.CSV_FILE.SEPARATOR, delimiter: CONSTANT.CSV_FILE.DELIMETER, onParseValue: csv.hooks.castToScalar }).filter(record => !record.NOSAUKUMS.includes(" "));
    },

    haveSearchResults() {
      return !this.residentialPlacesReflectedOnMap.length;
    },

    placeCornerResidentPlacesOnMap() {
      let southestResidentPlace = this.defaultPlaces[0];
      let northestResidentPlace = this.defaultPlaces[0];
      let easternResidentPlace = this.defaultPlaces[0];
      let westernResidentPlace = this.defaultPlaces[0];

      for (const place of this.defaultPlaces) {
        if (westernResidentPlace.DD_E < place.DD_E)
          westernResidentPlace = place;

        if (easternResidentPlace.DD_E > place.DD_E)
          easternResidentPlace = place;

        if (southestResidentPlace.DD_N > place.DD_N)
          southestResidentPlace = place;

        if (northestResidentPlace.DD_N < place.DD_N)
          northestResidentPlace = place;
      }

      // for popup to be more informative
      southestResidentPlace.DEBESPUSE = 'Dienvidi';
      northestResidentPlace.DEBESPUSE = 'Ziemeļi';
      easternResidentPlace.DEBESPUSE = 'Austrumi';
      westernResidentPlace.DEBESPUSE = 'Rietumi';
      const farthestResidentPlaces = [southestResidentPlace, northestResidentPlace, easternResidentPlace, westernResidentPlace];

      for (const place of farthestResidentPlaces) {
        L.marker([place.DD_N, place.DD_E]).addTo(this.mapHandler)
          .bindPopup(`Tālākais apdzīvotais punkts uz ${place.DEBESPUSE}em.<br>Apdz vietas nosaukums: ${place.NOSAUKUMS}.`)
          .openPopup();
      }
    },

    searchPlaces() {
      this.clearUserMapMarks();

      const filteredPlaces = this.defaultPlaces.filter((place) => {
        return place.NOSAUKUMS && place.NOSAUKUMS.toLowerCase().includes(this.searchText.toLowerCase());
      });

      // TODO: Probably need to figure out more user friendly marker
      const greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      for (const place of filteredPlaces) {
        const marker = L.marker([place.DD_N, place.DD_E], { icon: greenIcon }).addTo(this.mapHandler)
          .bindPopup(`Rezultāts .<br>Apdz vietas nosaukums: ${place.NOSAUKUMS}.`)
          .openPopup();

        this.residentialPlacesReflectedOnMapMarkers.push(marker);
        this.residentialPlacesReflectedOnMap.push(place);
      }
    },

    zoomToPlace() {
      const placeToZoom = this.residentialPlacesReflectedOnMap[0]; // TODO now if have multiple results show one need to make option on click move to next place
      this.mapHandler.setView([placeToZoom.DD_N, placeToZoom.DD_E], CONSTANT.DEFAULT_VIEW.PLACE_ZOOM);
    },

    toDefaults() {
      this.setDefaultView();
      this.clearUserMapMarks();
      this.searchText='';
    },

    setDefaultView() {
      this.mapHandler.setView([CONSTANT.DEFAULT_VIEW.LATITUDE, CONSTANT.DEFAULT_VIEW.LONGITUDE], CONSTANT.DEFAULT_VIEW.ZOOM);
    },

    clearUserMapMarks() {
      for (const placePopup of this.residentialPlacesReflectedOnMapMarkers)
        this.mapHandler.removeLayer(placePopup);

      this.residentialPlacesReflectedOnMapMarkers.length = 0;
      this.residentialPlacesReflectedOnMap.length = 0;
    }
  },
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