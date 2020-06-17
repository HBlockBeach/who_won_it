/////////////////
// LEAFLET MAP //
/////////////////
let winnerState = [];
let winnerWinner = [];
let winnerMargin = [];

// Functions to color-code map
function stateStyle(feature) {
  //console.log(`stateStyle for ${feature.properties.name}`);
  return {
      fillColor: getMargin(feature.properties.name),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.6
  };
}

function getMargin(state) {
  let margin = '';
  console.log(`getMargin for ${state}`);
  for (i=0; i < winnerState.length; i++) {
    if(winnerState[i] == state){
      margin = winnerMargin[i];
      console.log(winnerMargin);
    } 
    console.log(`get color for ${margin}`);
    switch(margin) {
      case -27.72:
        console.log("blue, " + margin);
        return "blue";
      case -14.73:
        console.log("lightblue " + margin);  
        return "lightblue";        
      case -3.54:
        return "yellow",
        console.log("yellow " + margin);
      case margin > -15:
        return "orange",
        console.log("orange " + margin);
      case margin < -15:
        return "red",
        console.log("red " + margin);
      default:
        return "white";
    }
  }
}

// function getColor(margin) {
//   console.log(`getColor for ${margin}`);
//   switch(true) {
//     case (margin > 15):
//       return "blue",
//       console.log("blue");
//     case (margin > 5):
//       return "lightblue",
//       console.log("lightblue");
//     case (margin > -5):
//       return "yellow",
//       console.log("yellow");
//     case (margin > -15):
//       return "orange",
//       console.log("orange");
//     case (margin < -15):
//       return "red",
//       console.log("red");
//     default:
//       return "pink";
//   }
// }

// Create Map & Tilelayer
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 4
});

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
}).addTo(myMap);

// Fetch function to create array from API
fetch("http://127.0.0.1:5000/state")
.then(function(resp) {
  return resp.json();
}) 
.then(function(data) {
  var features = data;
  var filtered2016 = features.filter(row => (row[1]==2016));
  for (i=0; i < filtered2016.length; i++) {
    winnerState.push(filtered2016[i][2]);
    winnerWinner.push(filtered2016[i][3]);
    winnerMargin.push(filtered2016[i][10]);
    } 
    console.log(winnerState[1], winnerWinner[1], winnerMargin[1]);
  })
.then(createGeojson);
 
function createGeojson() {
  L.geoJSON(statesData, {
    style: stateStyle,
    onEachFeature: function(feature, layer) {
      layer.on({
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        mouseout: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.6,
            color: 'white'
          });
        },
      });
      layer.bindPopup("<h5>State: " + feature.properties.name + "</h5>")
      // ("<p>Winner: " + winner2016(winnerArray, feature.properties.name) + "<p><br><p>Margin of Victory: " + margin2016(winnerArray, feature.properties.name) + "</p>");
    }
  }).addTo(myMap); 
}

// Create functions to pull correct popup values from winnerArray
// async function winner2016(winnerArray, state) {
//   for (i=0; i < 50; i++) {
//       if(await winnerArray.state == state){
//         return winnerArray.winner;
//       } 
//     }
// }

// async function margin2016(winnerArray, state) {
//   for (i=0; i < 50; i++) {
//       if(await winnerArray.state == state){
//         return winnerArray.margin;
//       } 
//     }
// }