var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});



function createFeatures(earthquakeData) {

  // Give each feature a popup
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Create a GeoJSON layer containing the features array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  var statesDataCoded = L.geoJSON(statesData);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, statesDataCoded);
}

function createMap(earthquakes, statesDataCoded) {

  // Define background layer
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Create overlay objects
  var overlayMaps = {
    Earthquakes: earthquakes,
    //States: statesDataCoded //,
    // Electoral Votes: electoralVotes,
    // Turnout Rate: turnout2016
  };

  // Create the map
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [lightmap, earthquakes, statesDataCoded]
  });

 
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(overlayMaps, null, {
      collapsed: false
  }).addTo(myMap);
}

//statesDataCoded.addTo(myMap);

//L.geoJSON(statesData).addTo(myMap);

// function to change state color based on margin of victory
// function getColor(mov) {
//     return  mov > 10 ? 'ca0020'
//             (mov >= -5 && mov <= 5) ? 'f4a582' :
//             (mov >= -5 && mov <= 5) ? 'f7f7f7' :
//             (mov >= -5 && mov <= 5) ? '92c5de' :
//             mov < -10 ? '0571b0':
//                         'bababa';
// }
// function style(feature) {
//     return {
//         fillColor: getColor(feature.properties.density),
//         weight: 2,
//         opacity: 1,
//         color: 'white',
//         dashArray: '3',
//         fillOpacity: 0.7
//     };
// }

// Function to build bar chart for turnout rate
function createBar(response) {

    // Initialize an array to hold bike markers
    var turnoutRate = [];
  
    // Loop through the stations array
    for (var i = 0; i < data.length; i++) {
      turnoutRate.push(data[i].turnout);
    }
}