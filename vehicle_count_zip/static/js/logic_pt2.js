// Create the map object with a center and zoom level
var map = L.map('map', { center: [37.7749, -122.4194], zoom: 6 });

// Add base map layers
var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var satellite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors, tiles from HOT'
});

var topography = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Tiles courtesy of OpenTopoMap'
});

// Add Streets as the default base map
streets.addTo(map);

// Layer groups for data points
var circleMarkers = L.layerGroup();
var heatmapLayer = null;

// Load the aggregated CSV data and process
d3.csv("static/data/aggregated_vehicle_data.csv").then(function (data) {
  var heatData = [];

  data.forEach((row) => {
    var zipCode = row.zip_code;
    var lat = parseFloat(row.lat);
    var lon = parseFloat(row.lon);
    var vehicles = parseInt(row.vehicles);

    // Validate data points
    if (isNaN(lat) || isNaN(lon) || isNaN(vehicles)) {
      console.log(`Skipping invalid data point: Zip Code ${zipCode}`);
      return;
    }

    // Add data point to heatmap
    heatData.push([lat, lon, vehicles / 7000]);

    var marker = L.circleMarker([lat, lon], {
      radius: vehicles / 500,
      fillColor: "#f1c232",
      color: "#333",
      weight: 1.5,
      fillOpacity: 0.8,
    }).bindPopup(
      `<h3 style="color: #4CAF50;">Zip Code: ${zipCode}</h3>
       <p style="font-weight: bold;">Vehicles: ${vehicles}</p>`
    );
    
    marker.addTo(circleMarkers)});

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
      1.0: "#FF0000"
    }
  });

  // Add Layer Control
  L.control.layers(
    {
      "Streets": streets,
      "Satellite": satellite,
      "Topography": topography
    },
    {
      "Circle Markers": circleMarkers,
      "Heatmap": heatmapLayer
    },
    { collapsed: false }
  ).addTo(map);
});

// Add a legend to the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend");
  var grades = [1, 501, 1001, 7001, 10001];
  var colors = ["#0000FF", "#00FF00", "#FFFF00", "#FFA500", "#FF0000"];

  div.innerHTML += "<h4 style='margin-bottom: 8px;'>Vehicle Count</br>Heatmap</h4>";
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      colors[i] +
      '; width: 15px; height: 15px; display: inline-block; margin-right: 5px; border: 1px solid #000;"></i> ' +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + (grades[i + 1] - 1) + "<br>" : "+");
  }

  return div;
};
legend.addTo(map);
// Add descriptions (tooltips) to layers in the Leaflet Layer Control
map.on("overlayadd", function () {
  const layerControl = document.querySelectorAll(".leaflet-control-layers-overlays label");
  layerControl.forEach((label) => {
    if (label.innerText.includes("Circle Markers")) {
      label.setAttribute("title", "Visualize zip codes as circles scaled by vehicle count.");
    } else if (label.innerText.includes("Heatmap")) {
      label.setAttribute("title", "A density map highlighting areas with higher or lower vehicle counts.");
    }
  });
});

map.on("baselayerchange", function () {
  const baseControl = document.querySelectorAll(".leaflet-control-layers-base label");
  baseControl.forEach((label) => {
    if (label.innerText.includes("Streets")) {
      label.setAttribute("title", "Interactive street view map with roads, highways, and urban layouts.");
    } else if (label.innerText.includes("Satellite")) {
      label.setAttribute("title", "Detailed satellite imagery for high-resolution geographic visualization.");
    } else if (label.innerText.includes("Topography")) {
      label.setAttribute("title", "A terrain map highlighting elevation, contours, and natural features.");
    }
  });
});