
//To place map on middle of Latvia
// Info is got from here - https://en.wikipedia.org/wiki/Module:Location_map/data/Latvia
const centerOfLatviaDDN = 57;
const centerOfLatviaDDE = 24.55;
const defaultZoomLevel = 7;
var map = L.map('map').setView([centerOfLatviaDDN, centerOfLatviaDDE], defaultZoomLevel);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);