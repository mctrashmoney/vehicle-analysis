// Create the map object with a center and zoom level
var map = L.map('map', { center: [37.7749, -122.4194], zoom: 6 });

// Add base map layers
var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var topography = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Tiles courtesy of OpenTopoMap'
});

// Layers for data points
var circleMarkers = L.layerGroup();
var heatmapLayer = null;

// Function to aggregate and filter vehicle data by ZIP code
function aggregateVehiclesByZipCode(data) {
  const zipCodeData = new Map();

  data.forEach(({ zip_code, lat, lon, vehicles }) => {
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    vehicles = parseInt(vehicles);

    // Filter: Only include points within California's boundaries
    if (lat < 32.5 || lat > 42.0 || lon < -124.5 || lon > -114.0) {
      console.warn(`Skipping data outside California: ${zip_code}`);
      return;
    }

    if (zipCodeData.has(zip_code)) {
      const current = zipCodeData.get(zip_code);
      current.vehicles += vehicles;
      current.latSum += lat;
      current.lonSum += lon;
      current.count += 1;
    } else {
      zipCodeData.set(zip_code, { vehicles, latSum: lat, lonSum: lon, count: 1 });
    }
  });

  return Array.from(zipCodeData.entries()).map(([zip_code, { vehicles, latSum, lonSum, count }]) => ({
    zip_code,
    vehicles,
    lat: latSum / count,
    lon: lonSum / count,
  }));
}

// Load and process CSV data
d3.csv("static/data/aggregated_vehicle_data.csv").then((rawData) => {
  const data = aggregateVehiclesByZipCode(rawData);

  var heatData = [];

  data.forEach(({ zip_code, lat, lon, vehicles }) => {
    // Add data point to heatmap
    heatData.push([lat, lon, vehicles / 7000]);

    // Add a circle marker for each ZIP code
    var marker = L.circleMarker([lat, lon], {
      radius: Math.min(20, vehicles / 500),
      fillColor: "#f1c232",
      color: "#333",
      weight: 1.5,
      fillOpacity: 0.8,
    }).bindPopup(
      `<h3 style="color: #4CAF50;">ZIP Code: ${zip_code}</h3>
       <p style="font-weight: bold;">Vehicles: ${vehicles}</p>`
    );

    marker.addTo(circleMarkers);
  });

  // Create the heatmap layer
  heatmapLayer = L.heatLayer(heatData, {
    radius: 30,
    blur: 30,
    maxZoom: 10,
    gradient: {
      0.0: "transparent",
      0.2: "#0000FF",
      0.4: "#00FF00",
      0.6: "#FFFF00",
      0.8: "#FFA500",
      1.0: "#FF0000",
    },
  });

  // Add Layer Control
  L.control.layers(
    { "Streets": streets, "Topography": topography },
    { "Circle Markers": circleMarkers, "Heatmap": heatmapLayer },
    { collapsed: false }
  ).addTo(map);
});

// Add legend
var legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "info legend");
  var grades = [1, 501, 1001, 7001, 10001];
  var colors = ["#0000FF", "#00FF00", "#FFFF00", "#FFA500", "#FF0000"];

  div.innerHTML += "<h4>Vehicle Count</h4>";
  grades.forEach((grade, i) => {
    div.innerHTML += `<i style="background:${colors[i]};"></i> ${grade}${grades[i + 1] ? "&ndash;" + (grades[i + 1] - 1) : "+"}<br>`;
  });
  return div;
};
legend.addTo(map);
