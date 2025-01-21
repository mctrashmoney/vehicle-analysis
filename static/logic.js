// Load and process the data, then initialize plots
function letsplot(columnx, columny) {
  d3.csv("vehicle_cleaned (2).csv").then(function (data) {
    // Parse numeric columns
    data.forEach((row) => {
      row.model_year = +row.model_year;
      row.vehicles = +row.vehicles;
    });

    // Filter data for the initial year (2009)
    let filterdata = data.filter((row) => row.model_year === 2009);
    createbar(filterdata, columnx, columny);
    createpie(filterdata, columnx);
  });
}

// Update plots on dropdown selection
d3.select("#selDataset").on("change", function () {
  let year = +d3.select(this).property("value"); // Get selected year
  d3.csv("vehicle_cleaned (2).csv").then(function (data) {
    // Parse numeric columns
    data.forEach((row) => {
      row.model_year = +row.model_year;
      row.vehicles = +row.vehicles;
    });

    // Filter data by the selected year
    let filterdata = data.filter((row) => row.model_year === year);
    createbar(filterdata, "fuel", "vehicles");
    createpie(filterdata, "fuel");
  });
});

// Create bar chart
function createbar(data, columnx, columny) {
  let fueltype = data.map((row) => row[columnx]);
  let vehicleCounts = data.map((row) => row[columny]);

  let trace = {
    x: fueltype,
    y: vehicleCounts,
    type: "bar",
  };

  let layout = {
    title: "Vehicle Fuel Type Count By Model Year ",
    xaxis: { title: columnx },
    yaxis: { title: columny },
  };

  Plotly.newPlot("bar", [trace], layout);
}

// Create pie chart
function createpie(data, columnx) {
  // Aggregate fuel types and sum the number of vehicles
  let fuelCounts = {};
  data.forEach((row) => {
    if (!fuelCounts[row[columnx]]) {
      fuelCounts[row[columnx]] = row.vehicles || 0;
    } else {
      fuelCounts[row[columnx]] += row.vehicles || 0;
    }
  });

  const labels = Object.keys(fuelCounts);
  const values = Object.values(fuelCounts);

  // Create the pie chart
  const trace = {
    labels: labels,
    values: values,
    type: "pie",
    textinfo: "label+value|percent",
  };

  const layout = {"title_x": "2.00",
    title: {
      text: 'Vehicle fuel Count By Model Year ',
      verticalAlign: "bottom",
      
       "y" : 0,
    "yanchor" : "bottom"   
  },
    showlegend: true,
  
  };

  Plotly.newPlot("pie", [trace], layout);
}

// Initialize the plots
letsplot("fuel", "vehicles");