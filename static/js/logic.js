// load static server: python -m http.server

// create a function to to colour eQuake location based on magnitude
function eQuakeColour(mag) {
    if(mag >= 7.0) {
        return "#000000";
    }
    else if(mag >= 6.0) {
        return  "#8B0000";
    }
    else if(mag >= 5.0) {
        return  "#FF0000";
    }
    else if(mag >= 4.0) {
        return  "#FFA500";
    }
    else if(mag >= 2.0) {
        return  "#FFFFE0";
    }
    else if(mag >= 1.0)
        return "#CEFAD0";
    else {
        return "#F8F8FF";
    }
}

// create a function to produce dynmaic radius
function eQuakeRadius(mag) {
    if(mag >= 7.0) {
        return mag * 4;
    }
    else if(mag >= 6.0) {
        return  mag * 2.5;
    }
    else if(mag >= 5.0) {
        return  mag * 2;
    }
    else if(mag >= 4.0) {
        return  mag * 1.5;
    }
    else if(mag >= 2.0) {
        return  mag * 1;
    }
    else if(mag >= 1.0)
        return mag * 0.5;
    else {
        return mag;
    }
}
// function for legend colours
function legendColour(d) {
    return d === 'Major (7.0+)' ? "#000000" :
        d === 'Strong (6.0-6.9)' ? "#8B0000" :
        d === 'Moderate (5.0-5.9)' ? "#FF0000" : 
        d === 'Light (4.0-4.9)' ? "#FFA500" :
        d === 'Minor (2.0-3.9)' ? "#FFFFE0" : 
        d === 'Micro (1.0-1.9)' ? "#CEFAD0" : "#F8F8FF";
}

// GET request to URL
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then(function(data) {
    // pass data to function 
    eQuakefeatures(data.features);
});

function eQuakefeatures(featureData) {
    // function to bind popup with descriptive info about eQuake
    function eQuakeInfo(feature, layer) {
        layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><p>" +
        "<h3> Date: " + new Date(feature.properties.time) + "</h3><p>" + "<h3> Magnitude: " + feature.properties.mag + "</h3><p>");
    }

    // function to produce circles
    function eQuakeMarkers(feature, latlng) {
        return L.circleMarker(latlng, {
            color: eQuakeColour(feature.properties.mag),
            radius: eQuakeRadius(feature.properties.mag),
            fill: true,
            stroke: true,
            weight: 1
        })
    }

    // create variable that passes all the information from the response to the map
    var eQuakes = L.geoJSON(featureData, {
        onEachFeature: eQuakeInfo,
        pointToLayer: eQuakeMarkers
    });

    createMap(eQuakes);
}

// create a map
function createMap (eQuakes) {
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
      });
      

    var baseMap = {
        "Light Map": lightmap
    };

    var overlayMap = {
        "Earthquakes": eQuakes
    }
    
    var map = L.map("map-id", {
        center: [40.73, -74.0059],
        zoom: 2,
        layers: [lightmap, eQuakes]
    });
    
    L.control.layers(baseMap, overlayMap, {
        collapsed: false
    }).addTo(map);

    // add a legend to the map
    var legend = L.control({position: 'bottomright'});
        legend.onAdd = function () {
            var div = L.DomUtil.create('div', 'info legend');
            labels = ['<strong>Richter Magnitude Scale</strong>'],
            scale = ['Micro (1.0-1.9)', 'Minor (2.0-3.9)', 'Light (4.0-4.9)', 'Moderate (5.0-5.9)', 'Strong (6.0-6.9)', 'Major (7.0+)'];
            for (var i = 0; i < scale.length; i++) {
                div.innerHTML +=
                labels.push('<i class="circle" style="background:' + legendColour(scale[i]) + '"></i>' + (scale[i] ? scale[i] : '+'));
                }
                div.innerHTML = labels.join('<br>');
            return div; 
            };
        legend.addTo(map);
}