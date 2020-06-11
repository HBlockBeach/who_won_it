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
//             (mov >= -5 && mov <= 5) ? '#ffffbf' :
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
    layers: [lightmap, statesDataCoded]
  });
 
  // Create the layer control
  L.control.layers(overlayMaps, null, {
      collapsed: false,
  }).addTo(myMap);

  // Add color-coded legend to map
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        var margins = ["Democrat (>15%)","Democrat (5-15%)","Swing State (5%)", "Republican (5-15%)", "Republican (>15%)"];
        var colors = ['#0571b0','#92c5de', '#ffffbf', '#f4a582', '#ca0020'];

        // loop through our arrays and generate a label with a colored square for each item
        for (var i = 0; i < margins.length; i++) {
            div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' + margins[i] + '<br>';
            }
        return div;
        };    

    legend.addTo(myMap);

    $(".leaflet-control-layers").prepend("<h5><label>Layer Control</label></h5>");
    $("div.info.legend").prepend("<h5><label>Margin Of Victory</label></h5>");
}

// API URLs for charts
turnoutURL = "http://127.0.0.1:5000/turnout"
yearURL = "http://127.0.0.1:5000/year"
stateURL = "http://127.0.0.1:5000/state"

// Build bar chart for total votes
d3.json(turnoutURL).then(function(turnoutData) {
  console.log(turnoutData);
  
  d3.json(stateURL).then(function(yearData) {
    var trace1 = [{
      type: "bar",
      x: turnoutData.map(row => row[1]),
      y: turnoutData.map(row => row[2]) 
    }]

    var layout = {
      xaxis: {
        title: "Year",
        range: [1972,2020],
        tickangle: -45,
        tickmode: 'linear',
        tick0: 1972,
        dtick: 4 
      },
      yaxis: {
        title: "Total Votes",
        showgrid: true,
        range: [0,150000000],
        tickmode: 'linear',
        tick0: 0,
        dtick: 25000000
      }
    }

    Plotly.newPlot("bar", trace1, layout);

  });
});

// Build bar chart for 3rd party candidate votes
d3.json(yearURL).then(function(yearData) {
  //console.log(yearData);

  d3.json(turnoutURL).then(function(turnoutData) {
    otherVotes = yearData.map(row => row[9]);
    totalVotes = turnoutData.map(row => row[2]);
    
    var votePercentage = [];
    for (var i = 0; i < otherVotes.length; i++) {
      votePercentage.push(otherVotes[i] / totalVotes[i] * 100);
    }

    console.log(votePercentage);

  var trace2 = [{
    type: "bar",
    x: yearData.map(row => row[1]),
    y: votePercentage,
    orientation: "v"
  }]

  var layout2 = {
    xaxis: {
      title: "Year",
      range: [1972,2020],
      tickangle: -45,
      tickmode: 'linear',
      tick0: 1972,
      dtick: 4 
    },
    yaxis: {
      title: "Votes",
      showgrid: true
      // range: [0,150000000],
      // tickmode: 'linear',
      // tick0: 0,
      // dtick: 25000000
    }
  }

    Plotly.newPlot("bar-other", trace2, layout2);
  });
});