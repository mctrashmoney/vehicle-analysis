// Initialize map over California 
const map = L.map('map').setView([36.7783, -119.4179], 6); 

// Add OpenStreetMap tiles 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
attribution: '&copy; OpenStreetMap contributors' 
}).addTo(map); 

// Create marker cluster group 
const markers = L.markerClusterGroup();

// Storage for data 
let vehicleData = []; 
let vehicleMakes = []; 
let aggregatedData = {}; 

// Load CSV Data 
function loadCSVData() { 
d3.csv('static/data/vehicle_cleaned.csv').then(data => { 
const validData = data.filter(item => 
item.zip_code && item.make && item.lat && item.lon && item.vehicles && item.vehicles.trim() !== '' 
); 
vehicleData = validData; 
aggregateVehiclesByZip(vehicleData); 

// Populate dropdown with vehicle makes 
vehicleMakes = [...new Set(vehicleData.map(item => item.make))]; 
vehicleMakes.forEach(make => { 
let option = document.createElement('option'); 
option.value = make; 
option.textContent = make; 
document.getElementById('vehicle-make').appendChild(option); 
}); 
updateMap('all', ''); 
createPieChart(''); 
createStackedBarChart(); 
}).catch(error => { 
console.error('Error loading CSV:', error); 
}); 
} 

// Aggregate vehicle data by ZIP and make 
function aggregateVehiclesByZip(data) { 
aggregatedData = {}; 
data.forEach(item => { 
const zip = item.zip_code; 
const make = item.make; 
const vehicles = parseInt(item.vehicles); 
const key = `${zip}_${make}`; 
if (!aggregatedData[key]) { 
aggregatedData[key] = { vehicles: 0, lat: item.lat, lon: item.lon }; 
} 
aggregatedData[key].vehicles += vehicles; 
}); 
} 

// Update map markers based on selected vehicle make and ZIP code 
function updateMap(make, zipFilter = "") {
    markers.clearLayers();  // Clear existing markers

    // Filter vehicle data based on make and zip code
    let filteredData = vehicleData; // Start with all vehicle data

    // Apply make filter if it's not 'all'
    if (make !== 'all') {
        filteredData = filteredData.filter(item => item.make === make);
    }

    // Apply zip code filter if provided
    if (zipFilter && zipFilter.trim() !== "") {
        filteredData = filteredData.filter(item => item.zip_code === zipFilter);
    }

    // If no data matches, show a message at a default location
    if (filteredData.length === 0) {
        const noDataMessage = "No data found for this selection.";
        const latLon = [36.7783, -119.4179];  // Default to California's center
        const marker = L.marker(latLon).bindPopup(noDataMessage);
        marker.addTo(map);
        map.setView(latLon, 6);  // Reset map view to broader zoom level
        return;
    }

    let firstLocation = null;  // To store the first location for zooming
    let addedMarkers = new Set(); // To keep track of added markers by unique key

    // Loop through filtered data to create markers
    filteredData.forEach(item => {
        const zip = item.zip_code;
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const key = `${zip}_${item.make}`; // Unique key based on make and zip code
        
        // Skip if this combination of ZIP and make has already been added
        if (addedMarkers.has(key)) {
            return; // Skip adding the marker
        }

        const vehicleCount = aggregatedData[key]?.vehicles || 0;

        // Set the first location for zooming
        if (!firstLocation) {
            firstLocation = [lat, lon];
        }

        // Calculate marker size dynamically based on vehicle count
        const markerSize = Math.min(Math.sqrt(vehicleCount) * 3, 30);  // Max size of 30 for large counts

        // Determine marker color based on vehicle count
        const color = vehicleCount > 300 ? 'red' :
                      vehicleCount > 150 ? 'orange' :
                      vehicleCount > 50 ? 'yellow' :
                      vehicleCount > 10 ? 'green' : 'blue';

        // Create the marker with specific properties
        const marker = L.circleMarker([lat, lon], {
            radius: markerSize,
            fillColor: color,
            color: "#000",  // Outline color
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6
        });

        // Add a popup to show vehicle info
        marker.bindPopup(`<b>ZIP Code: ${zip}</b><br>Vehicle Make: ${item.make}<br>Vehicles: ${vehicleCount}`);
        markers.addLayer(marker);  // Add marker to the marker group

        // Mark this combination as added
        addedMarkers.add(key);
    });

    map.addLayer(markers);  // Add marker group to the map

    // Set the map view to the first marker or zoom out to a default area if no markers exist
    if (firstLocation) {
        map.setView(firstLocation, 10);  // Zoom in after updating the markers
    }
}



// Create Pie Chart (filtered by ZIP if provided) 
function createPieChart(zipFilter) { 
const makeCounts = {}; 
Object.keys(aggregatedData).forEach(key => { 
const [zip, make] = key.split('_'); 
if (zipFilter && zip !== zipFilter) return; 
if (!makeCounts[make]) { 
makeCounts[make] = 0; 
} 
makeCounts[make] += aggregatedData[key].vehicles; 
}); 
const sortedMakes = Object.keys(makeCounts).map(make => ({ 
make: make, 
count: makeCounts[make] 
})).sort((a, b) => b.count - a.count); 
const topMakes = sortedMakes.slice(0, 10); 
const data = [{ 
labels: topMakes.map(item => item.make), 
values: topMakes.map(item => item.count), 
type: 'pie', 
hole: 0, 
}]; 
const titleText = zipFilter ? `Top 10 Vehicle Makes in ZIP Code ${zipFilter}` : "Top 10 Vehicle Makes";
const layout = { 
    title: titleText, 
    showlegend: true,
    legend: {
        x: 0.6, 
        y: 0.5,  
        orientation: "v",  // Keeps legend vertical
        bgcolor: 'rgba(255, 255, 255, 0.7)',  // Semi-transparent background
        bordercolor: "black",
        borderwidth: 1
    }
};

Plotly.newPlot('pie-chart-container', data, layout);


Plotly.newPlot('pie-chart-container', data, layout); 
} 

// Create a stacked bar chart (10 Nearby ZIP Codes & Top 10 Makes) 
function createStackedBarChart() { 
let zipData = {}; 

// Aggregate vehicle counts by ZIP and Make 
Object.keys(aggregatedData).forEach(key => { 
const [zip, make] = key.split('_'); 
let vehicles = aggregatedData[key].vehicles; 
if (!zipData[zip]) { 
zipData[zip] = { total: 0 }; 
} 
if (!zipData[zip][make]) { 
zipData[zip][make] = 0; 
} 
zipData[zip][make] += vehicles; 
zipData[zip].total += vehicles; // Ensure accurate total count 
}); 

// Sort ZIP codes by total vehicle count 
let sortedZips = Object.keys(zipData) 
.map(zip => ({ zip: zip, total: zipData[zip].total })) 
.sort((a, b) => b.total - a.total);

// Select 10 ZIP codes that are numerically close 
let midIndex = Math.floor(sortedZips.length / 2); 
let nearbyZipCodes = sortedZips.slice(midIndex - 5, midIndex + 5).map(entry => entry.zip); 

// Filter data to only include the selected ZIP codes 
let filteredZipData = {}; 
nearbyZipCodes.forEach(zip => { 
if (zipData[zip]) { // Ensure ZIP exists 
filteredZipData[zip] = zipData[zip]; 
} 
}); 

// Get vehicle make totals and select Top 10 Makes 
let makeCounts = {}; 
Object.values(filteredZipData).forEach(zipData => { 
Object.keys(zipData).forEach(make => { 
if (make !== "total") { 
if (!makeCounts[make]) { 
makeCounts[make] = 0; 
} 
makeCounts[make] += zipData[make]; // Fix: Correctly sum makes 
} 
}); 
}); 

// Sort makes by total count and select Top 10 
let top10Makes = Object.keys(makeCounts) 
.map(make => ({ make: make, count: makeCounts[make] })) 
.sort((a, b) => b.count - a.count) 
.slice(0, 10) 
.map(entry => entry.make);

// Prepare data for Plotly 
let traces = top10Makes.map(make => { 
return { 
x: nearbyZipCodes, 
y: nearbyZipCodes.map(zip => filteredZipData[zip][make] || 0), 
name: make, 
type: 'bar', 
marker: { opacity: 0.85 } 
}; 
}); 

// Define layout 
let layout = { 
title: '🚗 Vehicle Distribution (Nearby 10 ZIP Codes & Top 10 Makes)', 
barmode: 'stack', 
xaxis: { 
title: 'ZIP Code', 
tickmode: 'array', 
tickvals: nearbyZipCodes, 
ticktext: nearbyZipCodes.map(zip => `${zip}`), 
tickangle: -45 
}, 
yaxis: { 
title: 'Vehicle Count', 
zeroline: false 
}, 
legend: { 
title: { text: "Vehicle Make" }, 
orientation: "h", 
y: -0.3 
} 
}; 

// Render chart 
Plotly.newPlot('stacked-bar-container', traces, layout); 
} 

// Create Bubble Chart for vehicle makes across ZIP codes
function createBubbleChart(zipFilter = "") {
    let bubbleData = [];

    // Aggregate vehicle counts by ZIP and Make
    Object.keys(aggregatedData).forEach(key => {
        const [zip, make] = key.split('_');
        let vehicles = aggregatedData[key].vehicles;

        // Apply ZIP filter if needed
        if (zipFilter && zip !== zipFilter) return;

        bubbleData.push({
            zip: zip,
            make: make,
            count: vehicles
        });
    });

    // Extract unique makes and assign colors
    let uniqueMakes = [...new Set(bubbleData.map(item => item.make))];

    // Generate traces for each make
    let traces = uniqueMakes.map(make => {
        let filteredData = bubbleData.filter(item => item.make === make);

        return {
            x: filteredData.map(item => item.zip),
            y: filteredData.map(item => item.count),
            text: filteredData.map(item => `Make: ${item.make}<br>ZIP: ${item.zip}<br>Count: ${item.count}`),
            mode: 'markers',
            marker: {
                size: filteredData.map(item => Math.sqrt(item.count) * 2), // Scaled size
                opacity: 0.7
            },
            name: make
        };
    });
    let uniqueZipCodes = [...new Set(bubbleData.map(item => item.zip))];
    let tickSpacing = Math.ceil(uniqueZipCodes.length / 10);     // Show every 10th ZIP code

    // Define layout for the Bubble Chart
    let layout = {
        title: 'Bubble Chart - Vehicle Make Distribution by ZIP Code',
        xaxis: {
            title: 'ZIP Code',
            tickangle: -45,  // Slight rotation for readability
            tickmode: 'array',  
            tickvals: uniqueZipCodes.filter((_, i) => i % tickSpacing === 0), // Show every 10th ZIP
            ticktext: uniqueZipCodes.filter((_, i) => i % tickSpacing === 0), 
            showgrid: false
        },
        yaxis: { title: 'Vehicle Count' },
        hovermode: 'closest'
    };

    // Ensure the container exists before plotting
    if (document.getElementById('bubble-chart-container')) {
        Plotly.newPlot('bubble-chart-container', traces, layout);
    }
}

// Modify loadCSVData() to include Bubble Chart
function loadCSVData() {
    d3.csv('static/data/vehicle_cleaned.csv').then(data => {
        const validData = data.filter(item =>
            item.zip_code && item.make && item.lat && item.lon && item.vehicles && item.vehicles.trim() !== ''
        );

        vehicleData = validData;
        aggregateVehiclesByZip(vehicleData);

        // Populate dropdown with vehicle makes
        vehicleMakes = [...new Set(vehicleData.map(item => item.make))];
        vehicleMakes.forEach(make => {
            let option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            document.getElementById('vehicle-make').appendChild(option);
        });

        updateMap('all', '');
        createPieChart('');
        createStackedBarChart();
        createBubbleChart(); // ✅ Now runs AFTER data is loaded
    }).catch(error => {
        console.error('Error loading CSV:', error);
    });
}

// Event listener for ZIP Code search
document.getElementById('search-zip').addEventListener('click', () => {
    const zipCode = document.getElementById('zip-code').value.trim();
    if (!zipCode) {
        alert("Please enter a valid ZIP code.");
        return;
    }
    createPieChart(zipCode);
    createStackedBarChart(zipCode);
    createBubbleChart(zipCode); // ✅ Now updates when ZIP is searched
});


// Event listener for dropdown (Make selection) 
document.getElementById('vehicle-make').addEventListener('change', (e) => { 
const selectedMake = e.target.value; 
const zipCode = document.getElementById('zip-code').value.trim(); 
updateMap(selectedMake, zipCode); 
createPieChart(zipCode); 
}); 

// Event listener for ZIP Code search 
document.getElementById('search-zip').addEventListener('click', () => { 
const zipCode = document.getElementById('zip-code').value.trim(); 
if (!zipCode) { 
alert("Please enter a valid ZIP code."); 
return; 
} 
createPieChart(zipCode);
createStackedBarChart(zipCode);
}); 

// Load data on page load 
loadCSVData();

























