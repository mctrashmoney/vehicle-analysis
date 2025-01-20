// Load the aggregated CSV data and process
d3.csv("static/data/top_20_zip_codes.csv").then(function (data) {
  // Parse and sort data by vehicle amount (ascending)
  const sortedData = data
    .map(row => ({
      zip_code: row.zip_code, // Treat as string
      vehicles: parseInt(row.vehicles),
    }))
    .sort((a, b) => a.vehicles - b.vehicles)
    .slice(-20);

  // Prepare the data for Plotly
  const xValues = sortedData.map(row => row.zip_code);
  const yValues = sortedData.map(row => row.vehicles);
  const hoverText = sortedData.map(
    row => `ZIP Code: ${row.zip_code}<br>Vehicles: ${row.vehicles}`
  );

  const trace = {
    x: xValues,
    y: yValues,
    type: "bar",
    text: hoverText,
    hoverinfo: "text",
    marker: {
      color: "rgb(205, 212, 190)",
    },
  };

  const layout = {
    title: "Top 20 ZIP Codes by Vehicle Count",
    xaxis: {
      title: "ZIP Code",
      type: "category",
      automargin: true,
    },
    yaxis: {
      title: "Vehicle Count",
    },
    bargap: 0.05,
    bargroupgap: 0,
    margin: { t: 50, b: 120, l: 50, r: 50 },
  };

  // Render the chart in the plotly-container div
  Plotly.newPlot("plotly-container", [trace], layout)
    .then(() => console.log("Plotly interactive chart rendered successfully"))
    .catch(err => console.error("Plotly error:", err));
});