// -------------------------
// 🚗 CREATE BASE MAP LAYERS
// -------------------------

// Create the street map layer using OpenStreetMap tiles
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

// Create the topographic map layer using OpenTopoMap tiles
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
});

// ----------------------
// 🗺️ INITIALIZE THE MAP
// ----------------------

// Create the main map centered on California with an initial zoom level
let myMap = L.map("map", {
    center: [37.7749, -122.4194],  // San Francisco, CA
    zoom: 8,
    layers: [street]   // Default layer is the street map
});

// ----------------------
// 🔀 BASE LAYER CONTROL
// ----------------------

// Create a layer control to allow switching between Street and Topographic maps
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};

// Create overlays for car make count and luxury cars
let carMakeOverlay = L.layerGroup();
let luxuryCarOverlay = L.layerGroup();

// Add the layer control to the map
let layerControl = L.control.layers(baseMaps, { 
    "Car Make Count": carMakeOverlay, 
    "Luxury Cars": luxuryCarOverlay 
}, { collapsed: false }).addTo(myMap);

// ----------------------
// 🌟 DEFINE LUXURY BRANDS
// ----------------------

// List of luxury car brands for special highlighting
const luxuryCarBrands = [
    "BMW", "MERCEDES-BENZ", "AUDI", "TESLA", "PORSCHE", "LEXUS", "JAGUAR",
    "LAND ROVER", "CADILLAC", "INFINITI", "ACURA", "VOLVO", "MASERATI",
    "BENTLEY", "ROLLS-ROYCE", "FERRARI", "LAMBORGHINI", "BUGATTI",
    "MCLAREN", "ASTON MARTIN", "ALFA ROMEO"
];

// -----------------------------------
// 🎨 FUNCTION TO CHOOSE COLOR SCALE
// -----------------------------------

// Function to determine the color of ZIP codes based on vehicle count
function chooseColor(count) {
    if (count > 30000) return "#FF0000";    // Bright Red (High count)
    else if (count > 20000) return "#8000FF"; // Bright Purple
    else if (count > 10000) return "#FFFF00";  // Bright Yellow
    else if (count > 5000) return "#FF7F00";  // Bright Orange
    else if (count > 10) return "#0077FF";  // Bright Blue
    else return "#333333";                 // Dark Grey (Low count)
}

// ----------------------
// 📌 ADD LEGEND TO MAP
// ----------------------

// Create a legend to explain color coding for vehicle counts
let legend = L.control({ position: 'bottomleft' });

legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    let grades = [10, 1000, 5000, 10000, 20000, 30000];
    let colors = ["#333333", "#0077FF", "#FF7F00", "#FFFF00", "#8000FF", "#FF0000"];

    div.innerHTML += "<h4>Car Make Count</h4>";
    for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
};

// Add the legend to the map
legend.addTo(myMap);

// -------------------------
// 📊 LOAD DATA FROM FILES
// -------------------------

Promise.all([
    d3.json("static/data/ca_california_zip_codes_geo.min.json"),   // Load ZIP code boundaries
    d3.csv("static/data/vehicle_cleaned.csv")                      // Load vehicle data
]).then(([geoData, vehicleData]) => {                              
    let vehicleCounts = {};                                        // Stores vehicle counts per ZIP and make
    let luxuryCounts = {};                                         // Stores luxury vehicle counts per ZIP

    // ----------------------------
    // 🚗 AGGREGATE VEHICLE DATA
    // ----------------------------
      
    vehicleData.forEach(row => {
        let zip = row.zip_code;
        let make = row.make.toUpperCase();
        let vehicleCount = parseInt(row.vehicles) || 0; 

        if (!vehicleCounts[zip]) vehicleCounts[zip] = {};
        if (!vehicleCounts[zip][make]) vehicleCounts[zip][make] = 0;    // Convert count to number
        vehicleCounts[zip][make] += vehicleCount;

        // Count luxury cars separately
        if (luxuryCarBrands.includes(make)) {
            if (!luxuryCounts[zip]) luxuryCounts[zip] = {};
            if (!luxuryCounts[zip][make]) luxuryCounts[zip][make] = 0;
            luxuryCounts[zip][make] += vehicleCount;
        }
    });

    // ----------------------------
    // 🗺️ CREATE CHOROPLETH MAP
    // ----------------------------

    let geoLayer = L.geoJSON(geoData, {
        style: function (feature) {
            let zip = feature.properties.ZCTA5CE10;
            let totalVehicles = vehicleCounts[zip] 
                ? Object.values(vehicleCounts[zip]).reduce((a, b) => a + b, 0)  
                : 0;

            return {
                color: "white",
                fillColor: chooseColor(totalVehicles), 
                fillOpacity: 0.5,
                weight: 1.5
            };
        },
        onEachFeature: function (feature, layer) {
            let zip = feature.properties.ZCTA5CE10;
            let vehicleInfo = vehicleCounts[zip] || {};

            let popupContent = `<strong>ZIP Code: ${zip}</strong><br>`;
            let totalVehicles = 0;
            for (let make in vehicleInfo) {
                popupContent += `${make}: ${vehicleInfo[make]}<br>`;
                totalVehicles += vehicleInfo[make];
            }
            popupContent += `<br><strong>Total Vehicles: ${totalVehicles}</strong>`;

            layer.bindPopup(popupContent);
        }
    }).addTo(myMap);

    // ----------------------------
    // 🎛️ POPULATE VEHICLE MAKE DROPDOWN
    // ----------------------------

    let makes = new Set(vehicleData.map(row => row.make.toUpperCase()));
    let select = document.getElementById("make-select");
    makes.forEach(make => {
        let option = document.createElement("option");
        option.value = make;
        option.textContent = make;
        select.appendChild(option);
    });

     // ----------------------------
    // 🔍 EVENT LISTENER FOR SEARCHING
    // ----------------------------

    document.getElementById("search-button").addEventListener("click", function () {
        let selectedMake = document.getElementById("make-select").value.toUpperCase();
        let zipCode = document.getElementById("zip-search").value.trim();
        carMakeOverlay.clearLayers();
    
        let count = 0;
    
        geoData.features.forEach(feature => {
            let zip = feature.properties.ZCTA5CE10;
            let vehicleInfo = vehicleCounts[zip] || {};
    
            if (zipCode && zip !== zipCode) return;
    
            if (vehicleInfo[selectedMake]) {
                count += vehicleInfo[selectedMake];
    
                let coordinates = feature.geometry.coordinates;
                let lat, lon;
    
                if (coordinates && coordinates.length > 0) {
                    if (Array.isArray(coordinates[0][0])) {
                        lat = coordinates[0][0][1];
                        lon = coordinates[0][0][0];
                    } else {
                        lat = coordinates[0][1];
                        lon = coordinates[0][0];
                    }
                }
    
                if (typeof lat === 'number' && typeof lon === 'number') {
                    let carIcon = L.divIcon({
                        html: `<img src="./static/images/${selectedMake.toLowerCase()}.png" class="car-image" alt="${selectedMake}">`,
                        className: "car-marker"
                    });
    
                    let marker = L.marker([lat, lon], { icon: carIcon })
                        .bindPopup(`<strong>${selectedMake}</strong><br>ZIP Code: ${zip}<br>Vehicle Count: ${vehicleInfo[selectedMake]}`);
    
                    carMakeOverlay.addLayer(marker);
                }
            }
        });
    
        document.getElementById("vehicle-count").textContent = `Total Vehicles: ${count}`;
    });    

    // Highlight luxury car ZIP codes
    geoData.features.forEach(feature => {
        let zip = feature.properties.ZCTA5CE10;
        if (luxuryCounts[zip]) {
            let totalLuxuryCars = Object.values(luxuryCounts[zip]).reduce((a, b) => a + b, 0);

            let luxuryLayer = L.geoJSON(feature, {
                style: { color: "gold", fillColor: "gold", fillOpacity: 0.7, weight: 2 }
            });

            let popupContent = `<strong>ZIP Code: ${zip}</strong><br>
                                <strong>Total Luxury Cars: ${totalLuxuryCars}</strong><br>`;

            for (let make in luxuryCounts[zip]) {
                popupContent += `${make}: ${luxuryCounts[zip][make]}<br>`;
            }

            luxuryLayer.bindPopup(popupContent);
            luxuryCarOverlay.addLayer(luxuryLayer);
        }
    });

    // Add the car make overlay layer to the map
    myMap.addLayer(carMakeOverlay);
});


