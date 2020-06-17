//////////////////////////
// Animation for header //
//////////////////////////

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

/////////////////
// LEAFLET MAP //
/////////////////

// Function to color-code map
function getColor(margin) {
  //console.log(`getting color for ${margin}`);
  switch(true) {
    case (margin > 15):
      return 'red';
    case (margin > 5):
      return 'orange';
    case (margin > -5):
      return 'yellow';
    case (margin > -15):
      return 'lightblue';
    case (margin < -15):
      return 'blue';
    default:
      return 'black';
  }
}

var stateURL = "http://127.0.0.1:5000/state"

function getMargin(state) {
  d3.json(stateURL).then(function(stateLevelData) {
    //console.log(`getMargin running for ${state}`);
    var features = stateLevelData;
    var filtered2016 = features.filter(row => (row[1]==2016));
    for (i=0; i < filtered2016.length; i++) {
      if(filtered2016[i][2] == state){
        var margin = filtered2016[i][10];
        getColor(margin);
      } 
    }
});
}

function stateStyle(feature) {
  return {
      fillColor: getColor(feature[10]),
      weight: 1,
      opacity: 1,
      color: 'gray',
      fillOpacity: 0.7
  };
}

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

// Create array of variables to be used later in bindPopup
let winnerArray =  [];

d3.json(stateURL)
  .then(function(stateLevelData) {
    var features = stateLevelData;
    var filtered2016 = features.filter(row => (row[1]==2016));
    for (i=0; i < filtered2016.length; i++) {
      winnerArray.push({
        state: filtered2016[i][2],
        winner: filtered2016[i][3],
        margin: filtered2016[i][10]
      }); 
    }
    console.log(winnerArray);
  })
  // Create GeoJSON layer
  .then(function(winnerArray) { 
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
              fillOpacity: 0.7,
              color: 'gray'
            });
          },
        });
        layer.bindPopup("<p>Winner: " + winner2016(winnerArray, feature.properties.name) + "<p><br><p>Margin of Victory: " + margin2016(winnerArray, feature.properties.name) + "</p>");
      }
  }).addTo(myMap);
});

// Create functions to pull correct popup values from winnerArray
async function winner2016(winnerArray, state) {
  for (i=0; i < 50; i++) {
      if(await winnerArray.state == state){
        return winnerArray.winner;
      } 
    }
}

async function margin2016(winnerArray, state) {
  for (i=0; i < 50; i++) {
      if(await winnerArray.state == state){
        return winnerArray.margin;
      } 
    }
}

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

/////////////////
// BAR CHARTS //
/////////////////
// Other API URLs for charts
var turnoutURL = "http://127.0.0.1:5000/turnout"
var yearURL = "http://127.0.0.1:5000/year"

// Build bar chart for turnout %
d3.json(turnoutURL).then(function(turnoutData) {
  totalVotes = turnoutData.map(row => row[2]);
  eligibleVotes = turnoutData.map(row => row[3]);
  
  var turnoutPercentage = [];
  for (var i = 0; i < totalVotes.length; i++) {
    turnoutPercentage.push(totalVotes[i] / eligibleVotes[i]);
  }
  
  var trace1 = [{
    type: "bar",
    x: turnoutData.map(row => row[1]),
    y: turnoutPercentage 
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
      title: "Voter Turnout (%)",
      showgrid: true,
      tickformat: ',.0%',
      range: [0.45, 0.65]
    }
  }

  Plotly.newPlot("bar", trace1, layout);
});

// Build bar chart for 3rd party candidate votes
d3.json(yearURL).then(function(yearData) {
  
  d3.json(turnoutURL).then(function(turnoutData) {
    otherVotes = yearData.map(row => row[9]);
    totalVotes = turnoutData.map(row => row[2]);
    
    var votePercentage = [];
    for (var i = 0; i < otherVotes.length; i++) {
      votePercentage.push(otherVotes[i] / totalVotes[i]);
    }

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
      title: "3rd Party Votes (%)",
      showgrid: true,
      tickformat: ',.0%',
      range: [0,0.2]
    }
  }

    Plotly.newPlot("bar-other", trace2, layout2);
  });
});

//////////////
//PIE CHART //
//////////////
function createchart(yearinput){
  d3.json(yearURL).then(function(yearData) {
    //console.log(yearData);
      var dataForInput = yearData.filter(row => row[1] == yearinput);
      candidate1 = dataForInput.map(row => row[2]);
      candidate2 = dataForInput.map(row => row[5]);
      candidate3 = dataForInput.map(row => row[8]);
      candidate1votes = dataForInput.map(row => row[3]/10000);
      candidate2votes = dataForInput.map(row => row[6]/10000);
      candidate3votes = dataForInput.map(row => row[9]/10000);
      votes1 = Math.round(candidate1votes)
      votes2 = Math.round(candidate2votes)
      votes3 = Math.round(candidate3votes)
      label = [candidate1, candidate2, candidate3]
      value = [votes1, votes2, votes3]
      console.log(votes1, votes2, votes3);
      var data = [{
        labels: label,
        values: value,
        type: 'pie'
      }]
      var layout = {
        height: 400,
        width: 500
      }
      Plotly.newPlot('pie', data, layout);
    });}
// Input default chart for 2016
createchart(1976);

d3.selectAll("#selYear").on("change", updatePage);
function updatePage() {
  // Use D3 to select the dropdown menu
  var dropdownMenu = d3.selectAll("#selYear").node();
  // Assign the dropdown menu item ID to a variable
  var dropdownMenuID = dropdownMenu.id;
  // Assign the dropdown menu option to a variable
  var selectedOption = dropdownMenu.value;
  console.log(dropdownMenuID);
  console.log(selectedOption);
  createchart(selectedOption);}