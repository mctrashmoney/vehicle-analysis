# Vehicle Analysis

This project processes and analyzes vehicle data, with the goal of providing insights into various aspects of vehicle demographics across different ZIP codes. The project consists of two main parts:

## Data Processing and Storage
In the first part, the project focuses on extracting, cleaning, and storing vehicle data. Geographic coordinates (latitude and longitude) are retrieved for each ZIP code through API calls. The data is then cleaned by handling missing values and unwanted entries, aggregated, and inserted into a PostgreSQL database. The project uses various Python libraries, including pandas for data manipulation, requests for API calls, psycopg2 for PostgreSQL database operations, and SQLAlchemy as an ORM for managing the database.

## Data Visualization
The second part of the project utilizes the cleaned data for creating interactive visualizations. These visualizations allow users to explore vehicle data across different regions and vehicle attributes. Key visualizations include:

Vehicle Age by Zip Code: Analyzing the age of vehicles across different ZIP codes.
Vehicle Count by Zip Code: Visualizing the number of vehicles per ZIP code.
Make Distribution by Zip Code: Showing the distribution of vehicle makes across ZIP codes.
Vehicle Count by Make: Analyzing the total number of vehicles for each make.
Fuel Type Distribution by Model Year: Exploring how fuel preferences have evolved over time in relation to vehicle model years.
These visualizations provide a comprehensive understanding of vehicle demographics, helping to identify regional trends and patterns in vehicle age, make, fuel type, and density.



## Data Processing and Storage - Vehicle Analysis Workflow

### Libraries

•	pandas: Data manipulation and cleaning.

•	requests: Making API calls to retrieve geographic data (latitude and longitude) for each ZIP code.

•	psycopg2: PostgreSQL database connector.

•	SQLAlchemy: ORM for managing PostgreSQL database operations.

•	json: Used for converting CSV data to JSON format.

•	csv: For reading and writing CSV files.

### Files

•	vehicle-fuel-type-count-by-zip-code-20231.csv: Original dataset containing vehicle fuel type data by ZIP code.

•	output_data.json: Intermediate JSON file containing vehicle data extracted from the CSV.

•	vehicle_cleaned_output.csv: Intermediate cleaned and processed data, after handling missing values and unwanted entries.

•	vehicle_cleaned.csv: Data from the PostgreSQL Database exported into csv file.

•	project3_VehicleAnalysis.ipynb: Jupyter notebook containing the code for data cleaning, processing, and operations for writing to   and reading from the database.

### Installation and Setup

•	Install all the mentioned libraries

•	Setup PostgreSQL Database

•	Ensure vehicle-fuel-type-count-by-zip-code-20231.csv is available in the same directory as the jupyter notebook

•	Once the depencies and files are ready, you can run the code in jupyter notebook

### Overview of workflow

1. Data Loading and CSV to JSON Conversion
The first step is to load the CSV file (vehicle-fuel-type-count-by-zip-code-20231.csv) and convert it into a JSON file (output_data.json). This JSON file contains the same vehicle data, but in JSON format.

2. Extracting ZIP Code and Fetching Latitude and Longitude
Using the requests library, the script makes API calls to https://geocode.xyz/{zip_code}?json=1 to retrieve the latitude and longitude for each unique ZIP code found in the data.

3. Adding Latitude and Longitude to the CSV Data
The latitude and longitude information is then merged with the original CSV data

4. Data Cleaning
The data is cleaned by dropping rows with missing or invalid values (such as 'Unk', 'OTHER/UNK', 'UNKNOWN', and '0'). The model_year column is also cleaned to replace entries starting with <2010 with the value 2009.

5. Saving Cleaned Data to CSV
The cleaned data is saved into a new CSV file (vehicle_cleaned_output.csv).

6. Inserting Data into PostgreSQL
The script then imports the cleaned data into a PostgreSQL database using SQLAlchemy and psycopg2. A Vehicle table is created with the relevant columns, and the cleaned data is inserted into this table.

7. Reading Data from the Database and saving it into csv file
The script retrieves data from the database and loads it into a DataFrame. The data in the DataFrame is then exported to a CSV file named vehicle_cleaned.csv

8. Database Table Structure
The Vehicle table in the PostgreSQL database is structured to store vehicle data, including columns such as ZIP code, fuel type, model year, and geographic coordinates (latitude and longitude).

## Data Visualization

### Analysis of Vehicle Count By Make for California State :

### Libraries:

Leaflet

Leaflet MarkerCluster

D3.js

Highcharts

Plotly.js

Custom CSS (style.css)

Custom JavaScript (app.js)

### Files and Folder Structure:

•	index.html: HTML file for vehicle count analysis visualization.

•	style.css: CSS file for styling the visualization page.

•	app.js: JS file for handling map, charts, and data logic.

•	vehicle_cleaned.csv: CSV file containing vehicle data for this visualization.


```
vehicle-analysis/
│
├── vehicle-fuel-type-count-by-zip-code-20231.csv
├── output_data.json
├── vehicle_cleaned_output.csv
├── vehicle_cleaned.csv
├── project3_VehicleAnalysis.ipynb
├── README.md
├── vehicle_count_zip/
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── data/
│   │   │   ├── aggregated_vehicle_data.csv
│   │   │   ├── bottom_20_zip_codes.csv
│   │   │   └── top_20_zip_codes.csv
│   │   └── js/
│   │       ├── leaflet_logic.js
│   │       └── plotly_logic.js
│   ├── data_cleansing.ipynb
│   └── index.html
└── visualizations/
    └── Analysis of Vehicle Count By Make for California State/
        ├── index.html
        ├── style.css
        ├── app.js
        └── vehicle_cleaned.csv
```

### Installation and Setup:

•	Place the index.html, style.css, and app.js files in the same directory.

•	Open index.html in a web browser. You should be able to see the map and the various visualizations.


### Overview of Analysis of Vehicle Count By Make:

The project provides several interactive visualizations that represent vehicle data based on make and vehicle count. The different visualizations are listed below:
1. Map Visualization using Marker Cluster
2. Treemap
3. Bar Chart
4. Donut Chart
5. 3D Donut Chart

### Accessing the Visualizations:

To view the visualizations, open the HTML file in a web browser. Once the data is loaded in the webpage, the users can access these visualizations. Users can interact with the controls, filter and have access to data.

### GitHub Pages for hosting the Visualizations:

Map visualization can be viewed [here](https://mctrashmoney.github.io/vehicle-analysis/visualizations/Analysis%20of%20Vehicle%20Count%20By%20Make%20for%20California%20State/)

### Visualizing Vehicle Count by ZIP Code

Libraries used
* Leaflet
* Leaflet.Heat
* D3
* Plotly
* Custom CSS

Uses circleMarkers and the leaflet heatmap to highlight the bigger ZIP Codes (bigger circles meaning more vehicles)
This is shown via two maps: Street and Satellite

Map visualization can be viewed [here](https://mctrashmoney.github.io/vehicle-analysis/vehicle_count_zip/)
-----------------------------------------------------------------------------------------------------------
# **Make Distribution by Zip Code for California State**

## **📚 Libraries & Technologies Used**
- **Leaflet** - For interactive maps and geospatial visualizations.
- **Leaflet MarkerCluster** - To cluster vehicle locations and improve map readability.
- **Leaflet Heatmap Plugin** - For visualizing vehicle density using a heatmap.
- **D3.js** - For data loading, filtering, and handling CSV files.
- **Plotly.js** - For interactive charts (Pie Chart, Bubble Chart, and Stacked Bar Chart).
- **Custom CSS (style.css)** - Styling for visualization pages.
- **Custom JavaScript (logic.js, heatmap.js, leaflet-heat.js)** - Handles different visualization techniques.

---

## **📂 Files and Folder Structure**

### **📁 Choropleth Folder**
- **index.html:** HTML file for vehicle count analysis visualization.
- **style.css:** CSS file for styling the visualization page.
- **logic.js:** JavaScript file for processing and loading data.
- **vehicle_cleaned.csv:** CSV file containing vehicle data for this visualization.
- **ca_california_zip_codes_geo.min.json:** GeoJSON file containing ZIP code boundaries.

### **📁 Heatmap Folder**
- **index.html:** HTML file for vehicle count analysis visualization.
- **style.css:** CSS file for styling the visualization page.
- **heatmap.js:** JavaScript file for heatmap visualization.
- **vehicle_cleaned.csv:** CSV file containing vehicle data for this visualization.
- **ca_california_zip_codes_geo.min.json:** GeoJSON file containing ZIP code boundaries.
- **leaflet-heat.js:** JavaScript file for Leaflet heatmap implementation.

### **📁 Marker Cluster Map Folder**
- **index.html:** HTML file for vehicle count analysis visualization.
- **style.css:** CSS file for styling the visualization page.
- **logic.js:** JavaScript file for processing and loading data.
- **vehicle_cleaned.csv:** CSV file containing vehicle data for this visualization.
- **ca_california_zip_codes_geo.min.json:** GeoJSON file containing ZIP code boundaries.

---

## **🛠 Installation and Setup**
1. **Ensure all required files** (index.html, style.css, and JavaScript files) are in the same directory.
2. **Open index.html** in a web browser to visualize the interactive maps and charts.

---

## **📊 Overview of Make Distribution by Zip Code for California State**
This project provides several interactive visualizations representing vehicle distribution by make and count across California ZIP codes.

### **📌 Interactive Visualizations**
- **Marker Cluster Map**  
  - Displays vehicle locations using cluster markers.
  - Allows zooming in to reveal individual vehicle counts.

- **Pie Chart**  
  - Shows the top 10 vehicle makes in a selected ZIP code.
  - Highlights dominant brands such as Toyota, Honda, and Ford.

- **Stacked Bar Chart**  
  - Compares vehicle distribution across multiple ZIP codes.
  - Visualizes brand concentration in different locations.

- **Bubble Chart**  
  - Represents vehicle distribution with bubble sizes based on vehicle counts.
  - Provides a comparative view of make distribution.

- **Heatmap**  
  - Highlights high-density vehicle areas using color gradients.
  - Identifies urban centers with high vehicle clustering.

- **Choropleth Map**  
  - Uses color-coded regions to show vehicle density.
  - Provides insights into ZIP code divisions and dominant car brands.

---
## GitHub Pages for hosting the Visualizations:

<font color="blue">Choropleth can be viewed [here](https://mctrashmoney.github.io/vehicle-analysis/visualizations/Analysis_of_Zipcode_Make/Chropleth/)</font>

Heatmap can be viewed [here](https://mctrashmoney.github.io/vehicle-analysis/visualizations/Analysis_of_Zipcode_Make/Heatmap/)

Marker CLuster can be viewed [here](https://mctrashmoney.github.io/vehicle-analysis/visualizations/Analysis_of_Zipcode_Make/Marker%20_Cluster%20_Map/)


## **📂 Accessing the Visualizations**
1. Open the **HTML file** in a browser.
2. Once the data loads, interact with controls to explore the maps and charts.
3. Users can filter by vehicle make or ZIP code for detailed analysis.

---

## **📌 Key Takeaways**
- Some vehicle makes dominate certain ZIP codes.
- **Luxury brands** are concentrated in wealthier regions.
- **Toyota, Honda, and Ford** remain the most widespread.
- Interactive visualizations help businesses and policymakers analyze vehicle distribution.

This project provides a **detailed geographic analysis** of vehicle distribution, offering valuable insights for businesses, policymakers, and transportation planners.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Ethical Considerations

This project adheres to ethical principles of data privacy and responsible use of public datasets. 

All data used in this project is publicly available and does not contain personally identifiable information (PII). 

The project takes care to ensure that the visualizations do not expose sensitive information. 

Ethical considerations in data processing were made to ensure fair representation of vehicle types across ZIP codes.

1. Privacy

The dataset includes location information (latitude, longitude and zip codes) that could potentially be used to identify individuals or businesses in specific areas. We recommend generalizing location data when sharing the data in public domain to mitigate privacy risks.
Vehicle details in the dataset may seem non-sensitive, but in combination with personal data could pose privacy risks. Ensure the data is used responsibly.

2. Informed Consent

If the dataset involves personal vehicle information, it is necessary to inform the individuals about how their data will be used. Explicit consent must be obtained before using any personal information.

3. Data Accuracy and Representation:

Accuracy is critical in data analysis. Inaccurate, incomplete, or misleading data could lead to incorrect conclusions or decisions. Regular data validation and cleaning are recommended to ensure the integrity of the dataset.

4. Data Security:

Secure storage and sharing of the data is crucial. Proper encryption methods should be used to protect the dataset. Secure data transmission protocols are followed to prevent unauthorized access 

5. Regulatory Compliance:

Ensure that the use of this data complies with relevant privacy regulations. Adhering to the regulations is necessary to protect individuals' rights and avoid legal issues.

## Data Sources

Vehicle data for fuel type and ZIP code is sourced from https://catalog.data.gov/dataset/vehicle-fuel-type-count-by-zip-code.

Geographic data (latitude and longitude) is retrieved via the Geocode API.

## Code References

Geocode API was used to extract location details using zip codes [Geocode API Documentation](https://geocode.xyz/).

Leaflet, D3.js, Highcharts, Plotly.js, and other visualization libraries were used to create the interactive charts and maps.

Other Python libraries used include pandas, psycopg2, and SQLAlchemy



