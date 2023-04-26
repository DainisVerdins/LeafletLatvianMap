<template>
  <div class="map-container">
    <div id="map" />
    <div class="input-group mb-3 mt-3 px-3">
      <input type="text" class="form-control" placeholder="Apdzivotas vietas nosaukums" v-model="searchText">
      <div class="input-group-append ">
        <button class="btn btn-primary" @click="searchPlaces" type="button">Search</button>
        <button class="btn btn-secondary" @click="searchPlaces" type="button">Zoom result</button>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'Leaflet';
import * as csv from 'jquery-csv';

export default {
  data: () => ({
    theMap: null,
    defaultPlaces: null,
    searchText: null,

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
      // To place map on middle of Latvia
      // Info is got from here - https://en.wikipedia.org/wiki/Module:Location_map/data/Latvia
      const centerOfLatviaDDN = 57;
      const centerOfLatviaDDE = 24.55;
      const defaultZoomLevel = 7;
      this.theMap = L.map('map').setView([centerOfLatviaDDN, centerOfLatviaDDE], defaultZoomLevel);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.theMap);

      await this.initDefaultPlaces();

      this.placeCornerResidentPlacesOnMap();

    },

    async initDefaultPlaces() {
      const response = await fetch('../src/datafiles/AW_VIETU_CENTROIDI.CSV');
      const rawCSV = await response.text();
      /*
        According wikipedia living places are vilages, cities, 
        https://lv.wikipedia.org/wiki/Apdzīvota_vieta
        So filtering to only contain living places
        Non Living spaces have 2 and more words in it
      */
      this.defaultPlaces = await csv.toObjects(rawCSV, { separator: ';', delimiter: '#', onParseValue: csv.hooks.castToScalar }).filter(record => !record.NOSAUKUMS.includes(" "));
    },

    placeCornerResidentPlacesOnMap() {
      let southestResidentPlace = this.defaultPlaces[0];
      let northestResidentPlace = this.defaultPlaces[0];
      let easternResidentPlace = this.defaultPlaces[0];
      let westernResidentPlace = this.defaultPlaces[0];

      for (let i = 0; i < this.defaultPlaces.length; i++) {
        if (westernResidentPlace.DD_E < this.defaultPlaces[i].DD_E)
          westernResidentPlace = this.defaultPlaces[i];

        if (easternResidentPlace.DD_E > this.defaultPlaces[i].DD_E)
          easternResidentPlace = this.defaultPlaces[i];

        if (southestResidentPlace.DD_N > this.defaultPlaces[i].DD_N)
          southestResidentPlace = this.defaultPlaces[i];

        if (northestResidentPlace.DD_N < this.defaultPlaces[i].DD_N)
          northestResidentPlace = this.defaultPlaces[i];
      }
      // for popup to be more informative
      southestResidentPlace.DEBESPUSE = 'Dienvidi';
      northestResidentPlace.DEBESPUSE = 'Ziemeļi';
      easternResidentPlace.DEBESPUSE = 'Austrumi';
      westernResidentPlace.DEBESPUSE = 'Rietumi';
      const farthestResidentPlaces = [southestResidentPlace, northestResidentPlace, easternResidentPlace, westernResidentPlace];

      for (let i = 0; i < farthestResidentPlaces.length; i++) {
        L.marker([farthestResidentPlaces[i].DD_N, farthestResidentPlaces[i].DD_E]).addTo(this.theMap)
          .bindPopup(`Tālākais apdzīvotais punkts uz ${farthestResidentPlaces[i].DEBESPUSE}em.<br>Apdz vietas nosaukums: ${farthestResidentPlaces[i].NOSAUKUMS}.`)
          .openPopup();
      }
    },

    searchPlaces() {
      const output = this.defaultPlaces.filter((place) => {
        return place.NOSAUKUMS && place.NOSAUKUMS.toLowerCase().includes(this.searchText.toLowerCase());
      });

      for (let i = 0; i < output.length; i++) {
        L.marker([output[i].DD_N, output[i].DD_E]).addTo(this.theMap)
          .bindPopup(`Rezultāts .<br>Apdz vietas nosaukums: ${output[i].NOSAUKUMS}.`)
          .openPopup();
      }
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