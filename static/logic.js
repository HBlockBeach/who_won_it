// Animation for header
var card = document.querySelector(".card");
var playing = false;

card.addEventListener('click',function() {
  if(playing)
    return;
  
  playing = true;
  anime({
    targets: card,
    scale: [{value: 1}, {value: 1.4}, {value: 1, delay: 250}],
    rotateY: {value: '+=180', delay: 200},
    easing: 'easeInOutSine',
    duration: 400,
    complete: function(anime){
       playing = false;
    }
  });
});


var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// placeholder functions to simulate color-coded map with state coordinates data
function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

function stateStyle(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 1,
        opacity: 1,
        color: 'gray',
        fillOpacity: 0.7
    };
}

// function to change state color based on margin of victory
// function getColor(mov) {
//     return  mov > 10 ? '#ca0020'
//             (mov >= 5 && mov <= 10) ? '#f4a582' :
//             (mov >= -5 && mov <= 5) ? '#f7f7f7' :
//             (mov >= -5 && mov <= -10) ? '#92c5de' :
//             mov < -10 ? '#0571b0':
// }

d3.json(queryUrl, function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Create popups
  function onEachFeature(feature, layer) {
    layer.bindPopup("<p> Candidate 1: " + feature.properties.place +
      "</p><br><p> Candidate 2: " + new Date(feature.properties.time) + "</p>");
  }

  // Create GeoJSON layer for election data
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  // Create GeoJSON layer of state coordinates for color coding
  var statesDataCoded = L.geoJSON(statesData, {style: stateStyle});

  // Call createMap function
  createMap(earthquakes, statesDataCoded);
}

function createMap(earthquakes, statesDataCoded) {
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  var overlayMaps = {
    States: statesDataCoded,
    Earthquakes: earthquakes //,
    // Electoral Votes: electoralVotes,
    // Turnout Rate: turnout2016
  };

  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [lightmap, statesDataCoded]//, statesDataCoded]
  });
 
  // Create the layer control
  L.control.layers(overlayMaps, null, {
      collapsed: false,
  }).addTo(myMap);

  // Add color-coded legend to map
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        var margins = ["Democrat","","Swing State", "", "Republican"];
        var colors = ['#0571b0','#92c5de', '#f7f7f7', '#f4a582', '#ca0020'];

        // loop through our arrays and generate a label with a colored square for each item
        for (var i = 0; i < margins.length; i++) {
            div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' + margins[i] + '<br>';
            }
        return div;
        };    

    legend.addTo(myMap);
}


    


// Function to build bar chart for turnout rate
// function createBar(response) {

//     // Initialize an array to hold bike markers
//     var turnoutRate = [];
  
//     // Loop through the stations array
//     for (var i = 0; i < data.length; i++) {
//       turnoutRate.push(data[i].turnout);
//     }
// }