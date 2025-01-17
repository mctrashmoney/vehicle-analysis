// Initialize the map
const map = L.map('map').setView([36.7783, -119.4179], 6); // Default view over California

// Tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a marker cluster group
const markers = L.markerClusterGroup();

// Variable to store vehicle data and makes
let vehicleData = [];
let vehicleMakes = [];
let aggregatedData = {};

// Function to load CSV data using d3.csv
function loadCSVData() {
    d3.csv('vehicle_cleaned.csv').then(data => {
        // Filter out rows where essential data is missing
        const validData = data.filter(item => 
            item.date && item.model_year && item.fuel && item.duty && item.zip_code && item.make && item.lat && item.lon && item.vehicles && item.vehicles.trim() !== ''
        );

        console.log("Filtered valid data:", validData);

        // Assign the valid data to vehicleData
        vehicleData = validData;

        // Aggregate vehicles by ZIP code and make
        aggregateVehiclesByZip(vehicleData);

        // Extract unique vehicle makes
        vehicleMakes = [...new Set(vehicleData.map(item => item.make))];
        vehicleMakes.forEach(make => {
            let option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            document.getElementById('vehicle-make').appendChild(option);
        });

        // Initialize map with all data
        updateMap('all');

        // Create the Treemap
        createTreemap(); // Ensure Treemap is created after data is aggregated

        //Create barChart
        barChart();

        //donut chart
        donutChart();

        //pie chart
        donutChart3d();

    }).catch(error => {
        console.error('Error loading CSV data:', error);
    });
}

// Function to aggregate vehicle data by ZIP code and make
function aggregateVehiclesByZip(data) {
    aggregatedData = {};  // Reset the aggregated data

    data.forEach(item => {
        //console.log(item);
        const zip = item.zip_code;
        const make = item.make;
        const vehicles = parseInt(item.vehicles); // Ensure this is a valid number
        const modelYear = item.model_year;

        // Use a flat key for the aggregation: combination of zip, make, and model year
        const key = `${zip}_${make}_${modelYear}`;

        // Initialize the entry for this key if it doesn't exist
        if (!aggregatedData[key]) {
            aggregatedData[key] = { vehicles: 0, lat: item.lat, lon: item.lon }; // Store vehicle count, lat, lon
        }

        // Increment the vehicle count for this specific key (ZIP, make, model year)
        aggregatedData[key].vehicles += vehicles;
    });

    console.log(aggregatedData); // Log the aggregated data (for debugging)
}

// Function to update the map based on selected vehicle make
function updateMap(make) {
    markers.clearLayers();

    // Calculate total vehicle count for selected make or all makes
    let totalVehicleCount = 0;

    // If "All" is selected, aggregate the total across all makes
    Object.keys(aggregatedData).forEach(key => {
        const [zip, vehicleMake, modelYear] = key.split('_');
        if (make === 'all' || make === vehicleMake) {
            totalVehicleCount += aggregatedData[key].vehicles;
        }
    });

    // Update the vehicle count display
    document.getElementById('vehicle-count').innerHTML = `Total Vehicles: ${totalVehicleCount}`;

    // Filter data by selected vehicle make
    const filteredData = make === 'all' ? vehicleData : vehicleData.filter(item => item.make === make);

    // Add markers to the map based on filtered and aggregated data
    filteredData.forEach(item => {
        const zip = item.zip_code;
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        // Create the key for this location and make/model year
        const key = `${zip}_${item.make}_${item.model_year}`;
        const vehicleCount = aggregatedData[key]?.vehicles || 0;

        // Calculate marker size based on the aggregated vehicle count
        const markerSize = Math.sqrt(vehicleCount) * 3;

        // Create a circle marker with the appropriate size
        const marker = L.circleMarker([lat, lon], {
            radius: markerSize,
            fillColor: '#FF69B4',
            color: '#FF0000',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6
        });

        // Bind the popup to the specific make and model year
        marker.bindPopup(`<b>${item.make} ${item.model_year}</b><br>Zip Code: ${zip}<br>Vehicles: ${vehicleCount}`);

        // Add marker to cluster group
        markers.addLayer(marker);
    });

    map.addLayer(markers);
}

// Event listener for make selection
document.getElementById('vehicle-make').addEventListener('change', (e) => {
    updateMap(e.target.value);
});



/// Function to create a treemap visualization for vehicle makes and their counts
function createTreemap() {
    // Prepare data for the Treemap
    const makeCounts = {};

    // Aggregate vehicle counts by make
    Object.keys(aggregatedData).forEach(key => {
        const [zip, make, modelYear] = key.split('_');
        if (!makeCounts[make]) {
            makeCounts[make] = 0;
        }
        makeCounts[make] += aggregatedData[key].vehicles;
    });

    // Convert the makeCounts object into an array for the Treemap
    const treemapData = Object.keys(makeCounts).map(make => ({
        name: make,
        value: makeCounts[make]
    }));

    // Log treemapData for debugging
    console.log('Treemap Data:', treemapData);

    // Ensure the container is present and has a valid size
    const container = document.getElementById('treemap-container');
    if (!container) {
        console.error('Treemap container not found!');
        return;
    }

    // Get the width of the container and set a reasonable height
    const width = container.offsetWidth;
    const height = 400;  // You can adjust this height as needed

    // Log width and height for debugging
    console.log('Container width:', width, 'Container height:', height);

    // Set up the Treemap layout
    const treemap = d3.treemap()
        .size([width, height])  // Size adjusted based on container dimensions
        .padding(2);  // Padding between rectangles

    // Create a hierarchy for Treemap
    const root = d3.hierarchy({ children: treemapData })
        .sum(d => d.value);

    // Apply the treemap layout
    treemap(root);

    // Log the root structure after applying the treemap layout
    console.log('Treemap Root:', root);

    // Select the container and append the Treemap SVG
    let svg = d3.select("#treemap-container").select("svg");
    
    // If no SVG element exists, create one
    if (svg.empty()) {
        svg = d3.select("#treemap-container").append("svg")
            .attr("width", width)
            .attr("height", height);
    }

    // Clear any existing content in the container before adding the new Treemap
    svg.selectAll('*').remove();

    // Add a heading above the Treemap
    svg.append("text")
        .attr("x", width / 2)  // Position the heading at the center
        .attr("y", 20)         // Place it 20px from the top
        .attr("text-anchor", "middle")  // Center align the text
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text("Vehicle Counts by Make (Treemap)");

    // Create the Treemap rectangles (cells)
    const cells = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Add the rectangles for each make
    cells.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", "#e9f59f") // Set rectangle color
        .style("stroke", "#FF0000") // Stroke color
        .style("stroke-width", 1);

    // Add the labels inside the rectangles
    cells.append("text")
        .attr("x", 5)
        .attr("y", 5)
        .attr("dy", ".75em")
        .style("font-size", "10px")
        .style("fill", "#000")
        .text(d => d.data.name);  // Display the make name inside each rectangle

    // Optional: Add tooltips for each rectangle with vehicle count info
    cells.append("title")
        .text(d => `${d.data.name}: ${d.data.value} vehicles`);
}

function barChart() {
    // Prepare data for bar chart (total vehicle count per make)
    const makeCounts = {};
    vehicleData.forEach(item => {
        const make = item.make;
        const vehicles = parseInt(item.vehicles);
    
        if (!makeCounts[make]) {
            makeCounts[make] = 0;
        }
        makeCounts[make] += vehicles;
    });

    // Convert the makeCounts object into an array and sort it by vehicle counts in descending order
    const sortedMakes = Object.keys(makeCounts).map(make => ({
        make: make,
        count: makeCounts[make]
    })).sort((a, b) => b.count - a.count);  // Sort by count in descending order
    console.log('sortedmakes',sortedMakes);

    // Select the top 20 makes
    const topMakes = sortedMakes.slice(0, 20);

    //////////////////////////////////////////////////////////////////////////////////////////////
    // Convert the makeCounts object into an array and sort it by vehicle counts in ascending order
    const sortedMakesbottom = Object.keys(makeCounts).map(make => ({
        make: make,
        count: makeCounts[make]
    })).sort((a, b) => a.count - b.count);  // Sort by count in descending order
    

    // Select the bottom 20 makes
    const bottomMakes = sortedMakesbottom.slice(0, 20);
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // Use D3 to select the dropdown menu
    let dropdownMenu = d3.select("#selDataset");

    // Assign the value of the dropdown menu option to a variable
    let dataset = dropdownMenu.property("value");

    // Prepare the data for Plotly
    let makes, counts;
    if (dataset === 'dataset1') {
        makes = topMakes.map(item => item.make);
        counts = topMakes.map(item => item.count);
      }
      else if (dataset === 'dataset2') {
        makes = bottomMakes.map(item => item.make);
        counts = bottomMakes.map(item => item.count);
      }

    ///////////////////////////////////////////////////////////////////////////////////////////////////

    // Prepare the data for Plotly
    //const makes = sortedMakes.map(item => item.make);
    //const counts = sortedMakes.map(item => item.count);

    // Create the bar chart
    const trace = {
        x: makes,
        y: counts,
        type: 'bar',
        marker: {
            color: '#cadb63',
        },
    };

    const layout = {
        
        xaxis: {
            title: 'Vehicle Make',
            tickangle: -45,
        },
        yaxis: {
            title: 'Number of Vehicles',
        },
    };

    Plotly.newPlot('bar-chart-container', [trace], layout);

}
// Event listener to update the chart when the dropdown selection changes
document.getElementById('selDataset').addEventListener('change', () => {
    barChart();
});



function donutChart() {
    // Prepare data for donut chart (total vehicle count per make)
    const makeCounts = {};
    vehicleData.forEach(item => {
        const make = item.make;
        const vehicles = parseInt(item.vehicles);

        if (!makeCounts[make]) {
            makeCounts[make] = 0;
        }
        makeCounts[make] += vehicles;
    });

    // Convert the makeCounts object into an array and sort it by vehicle counts in descending order
    const sortedMakes = Object.keys(makeCounts).map(make => ({
        make: make,
        count: makeCounts[make]
    })).sort((a, b) => b.count - a.count);  // Sort by count in descending order
    console.log('sortedmakes', sortedMakes);

    // Select the top 20 makes
    const topMakes = sortedMakes.slice(0, 20);

    // Prepare the data for Plotly
    const makes = topMakes.map(item => item.make);
    const counts = topMakes.map(item => item.count);

    // Create the donut chart
    const trace = {
        labels: makes,  // Labels for each slice (Vehicle makes)
        values: counts,  // Values for each slice (Vehicle counts)
        type: 'pie',
        hole: 0.4,  // This creates the "donut" by leaving a hole in the center
        marker: {
            colors: ['#cadb63', '#FF69B4', '#FF6347', '#FFD700', '#98FB98', '#87CEFA'],  // Optional: Add color array
        },
        //textinfo: 'percent+label',  // Display both the label and the percentage in each slice
        textinfo: 'label',  // Display the label in each slice
    };

    
    const layout = {
        title: 'Top 20 Vehicle Counts by Make (Donut Chart)',
        showlegend: true,  // Show the legend with the vehicle makes
        margin: {
            l: 40,  // Left margin
            r: 40,  // Right margin
            t: 40,  // Top margin
            b: 40,  // Bottom margin
        },
    };

    // Render the chart in the container with id 'donut-chart-container'
    Plotly.newPlot('donut-chart-container', [trace], layout);
}

///3D pie Chart
function donutChart3d() {
    // Prepare data for donut chart (total vehicle count per make)
    const makeCounts = {};
    vehicleData.forEach(item => {
        const make = item.make;
        const vehicles = parseInt(item.vehicles);

        if (!makeCounts[make]) {
            makeCounts[make] = 0;
        }
        makeCounts[make] += vehicles;
    });

    // Convert the makeCounts object into an array and sort it by vehicle counts in descending order
    const sortedMakes = Object.keys(makeCounts).map(make => ({
        make: make,
        count: makeCounts[make]
    })).sort((a, b) => b.count - a.count);  // Sort by count in descending order

    // Select the top 20 makes
    const topMakes = sortedMakes.slice(0, 20);

    // Prepare the data for Highcharts
    const makes = topMakes.map(item => item.make);
    const counts = topMakes.map(item => item.count);

    // Highcharts 3D Pie chart
    Highcharts.chart('3d-donut-chart-container', {
        chart: {
            type: 'pie',
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0,
                depth: 50
            }
        },
        title: {
            text: 'Top 20 Vehicle Counts by Make (3D Donut Chart)'
        },
        plotOptions: {
            pie: {
                innerSize: '40%',  // Creates the "donut" shape
                depth: 45,  // Depth of the pie
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'  // Display the make names
                }
            }
        },
        series: [{
            name: 'Vehicles',
            data: makes.map((make, i) => [make, counts[i]]),
            colors: ['#cadb63', '#FF69B4', '#FF6347', '#FFD700', '#98FB98', '#87CEFA'],  // Optional: Color array
            showInLegend: true
        }]
    });
}

// Load CSV data and initialize map
loadCSVData();