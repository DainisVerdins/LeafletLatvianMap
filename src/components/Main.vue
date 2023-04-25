<template>
  <div id="map"></div>
</template>

<script>
import L from 'Leaflet';

export default {
  data: () => ({
    theMap: null,
  }),

  mounted() {
    this.init();

  },
  methods: {
    init() {
      // To place map on middle of Latvia
      // Info is got from here - https://en.wikipedia.org/wiki/Module:Location_map/data/Latvia
      const centerOfLatviaDDN = 57;
      const centerOfLatviaDDE = 24.55;
      const defaultZoomLevel = 7;
      var map = L.map('map').setView([centerOfLatviaDDN, centerOfLatviaDDE], defaultZoomLevel);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const foo = this.getPlaces();
    },

    getPlaces() {
      fetch('../src/datafiles/AW_VIETU_CENTROIDI.CSV')
  .then(response => response.text())
  .then(text => console.log(text))
    }
  },
}
</script>

<style scoped>
#map {
  width: 1024px;
  /*make them constants? */
  height: 576px;
}
</style>