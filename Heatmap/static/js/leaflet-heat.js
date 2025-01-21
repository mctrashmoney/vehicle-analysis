// Create the map object
let myMap = L.map("map", {
    center: [36.7783, -119.4179], // Center the map on California
    zoom: 6
});

// Add a tile layer (the map background)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(myMap);

// Add a scale control to the map
L.control.scale().addTo(myMap);

// Add a mini map to the map
let miniMap = new L.Control.MiniMap(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'), {
    toggleDisplay: true,
    minimized: false,
    position: 'bottomright'
}).addTo(myMap);

// URL for the GeoJSON and CSV data files
let geoDataUrl = "./static/data/ca_california_zip_codes_geo.min.json";
let vehicleDataUrl = "./static/data/vehicle_cleaned.csv";

// Load the GeoJSON and CSV files using D3
Promise.all([
    d3.json(geoDataUrl),
    d3.csv(vehicleDataUrl)
]).then(([geoData, vehicleData]) => {
    console.log("GeoJSON Data:", geoData);
    console.log("Vehicle Data:", vehicleData);

    // Convert the vehicle data to a format suitable for heatmap
    let vehicleCounts = {};

    vehicleData.forEach(row => {
        let zip = row.zip_code;
        let make = row.make;

        if (!vehicleCounts[zip]) {
            vehicleCounts[zip] = 0;
        }
        vehicleCounts[zip]++;
    });

    console.log("Vehicle Counts:", vehicleCounts);

    // Create an array for the heatmap data
    let heatArray = [];

    geoData.features.forEach(feature => {
        let zip = feature.properties.ZCTA5CE10;
        let coordinates = feature.geometry.coordinates;

        if (coordinates && coordinates[0] && coordinates[0][0]) {
            let lat = coordinates[0][0][1];
            let lng = coordinates[0][0][0];
            let count = vehicleCounts[zip] || 0;

            if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
                heatArray.push([lat, lng, count]);
            }
        }
    });

    console.log("Heat Array:", heatArray);

    // Add the heatmap layer to the map
    let heat = L.heatLayer(heatArray, {
        radius: 20,
        blur: 35,
        gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
    }).addTo(myMap);

    // Add a legend to the map
    let legend = L.control({ position: "bottomleft" });
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        let grades = [0, 10, 50, 150, 300, 400];
        let labels = [];

        // Loop through grades to generate a label for each color
        for (let i = 0; i < grades.length; i++) {
            let nextGrade = grades[i + 1];
            labels.push(
                `<i style="background:${getColor(grades[i] + 1)}"></i> ${grades[i]}${nextGrade ? `&ndash;${nextGrade}` : "+"}`
            );
        }

        div.innerHTML = "<h4>Vehicle Count</h4>" + labels.join("<br>");
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);

    // Function to get color based on value with a new color scheme
    function getColor(d) {
        return d > 400 ? '#800026' : // Dark Red
               d > 300 ? '#BD0026' : // Red
               d > 150 ? '#E31A1C' : // Light Red
               d > 50  ? '#FC4E2A' : // Orange Red
               d > 10  ? '#FD8D3C' : // Orange
               d > 0   ? '#FEB24C' : // Light Orange
                         '#FFEDA0';  // Light Yellow
    }

}).catch(error => {
    console.error("Error loading data:", error);
});
