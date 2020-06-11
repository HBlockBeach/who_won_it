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
  return margin > 15 ? "red" :
         margin > 5  ? "orange" :
         margin > -5  ? "yellow" :
         margin > -15  ? "lightblue" :
                   "blue";
  // switch(true) {
  //   case margin > 15:
  //     return "red";
  //   case margin > 5:
  //     return "orange";
  //   case margin > -5:
  //     return "yellow";
  //   case margin > -15:
  //     return "lightblue";
  //   case margin < -15:
  //     return "blue";
  // }
}

var stateURL = "http://127.0.0.1:5000/state"

function getMargin(state) {
  d3.json(stateURL).then(function(stateLevelData) {
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
    fillColor: getMargin(feature.properties.name),
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  }
}

// Create GeoJSON layer of state coordinates for color coding
var statesDataCoded = L.geoJSON(statesData, {style: stateStyle});

var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 4,
  layers: [statesDataCoded]
});

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
}).addTo(myMap);


// var x = JSON.stringify(statesLatLng);
// var test = JSON.parse(x);
// console.log(test);

// var overlayMaps = {
//   States: statesDataCoded
//     Election_Results: elections,
//     Electoral_Votes: electoralVotes
//     // Turnout Rate: turnout2016
//};


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

//PIE CHART //
function createchart(yearinput){
  d3.json(yearURL).then(function(yearData) {
    //console.log(yearData);
      var dataForInput = yearData.filter(row => row[1] == yearinput);

      candidate1 = dataForInput.map(row => row[2]);
      candidate2 = dataForInput.map(row => row[5]);
      candidate3 = dataForInput.map(row => row[8]);
      candidate1votes = dataForInput.map(row => row[3]);
      candidate2votes = dataForInput.map(row => row[6]);
      candidate3votes = dataForInput.map(row => row[9]);

      console.log(candidate1votes);
    
      var data = [{
        y: [candidate1votes, candidate2votes, candidate3votes],
        x: [candidate1, candidate2, candidate3],
        type: 'pie'
      }]
      var layout = {
        height: 400,
        width: 500
      }
      Plotly.newPlot('pie', data, layout);
    });}

//var yearinput = 2016;
createchart("2016");