// Store the API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    

  // Give each feature a popup describing election results
  function onEachFeature(features, layer) {
    layer.bindPopup("<h3>" + features.properties.place +
      "</h3><hr><p>" + new Date(features.properties.time) + "</p>");
  }

  // Create a GeoJSON layer
  var electionByState = L.geoJSON(data, {
    onEachFeature: onEachFeature
  });

  console.log(features.properties);

  // Call createMap function
  createMap(electionByState);
});

function createMap(electionByState) {

    // Add tile layer (the background map image) to our map
    L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
    }).addTo(myMap);

    // Create overlay object
    var overlayMaps = {
        StateResults: electionByState
    };

    // Create map object - use [37,-102] for continental US
    var myMap = L.map("map", {
        center: [44.9672, -103.7714],
        zoom: 5,
        layers: electionByState
    });

    // Create a layer control
    L.control.layers(overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}
