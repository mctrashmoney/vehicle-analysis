# Vehicle Analysis

This project processes and analyzes vehicle data to provide insights into various aspects of vehicle demographics across different ZIP codes. The project consists of two main parts:

## Data Processing and Storage
The first part of the project focuses on extracting, cleaning, and storing vehicle data. Geographic coordinates (latitude and longitude) are retrieved for each ZIP code through API calls. The data is then cleaned by handling missing values and unwanted entries, aggregated, and inserted into a PostgreSQL database. The project uses various Python libraries, including:

- `pandas` for data manipulation
- `requests` for API calls
- `psycopg2` for PostgreSQL database operations
- `SQLAlchemy` as an ORM for managing the database
- `json` for converting CSV data to JSON format
- `csv` for reading and writing CSV files

### Files

- **vehicle-fuel-type-count-by-zip-code-20231.csv**: Original dataset containing vehicle fuel type data by ZIP code.
- **output_data.json**: Intermediate JSON file containing vehicle data extracted from the CSV.
- **vehicle_cleaned_output.csv**: Intermediate cleaned and processed data, after handling missing values and unwanted entries.
- **vehicle_cleaned.csv**: Data from the PostgreSQL database exported into a CSV file.
- **project3_VehicleAnalysis.ipynb**: Jupyter Notebook containing the code for data cleaning, processing, and database operations.

### Installation and Setup

1. Install the required libraries.
2. Set up the PostgreSQL database.
3. Ensure `vehicle-fuel-type-count-by-zip-code-20231.csv` is available in the same directory as the Jupyter Notebook.
4. Once dependencies and files are ready, run the code in Jupyter Notebook.

### Workflow Overview

1. **Data Loading and CSV to JSON Conversion**
   - Load the CSV file and convert it into a JSON file.

2. **Extracting ZIP Codes and Fetching Latitude/Longitude**
   - Use the `requests` library to call `https://geocode.xyz/{zip_code}?json=1` to retrieve coordinates.

3. **Adding Coordinates to CSV Data**
   - Merge latitude and longitude information with the original dataset.

4. **Data Cleaning**
   - Drop rows with missing or invalid values.
   - Standardize model year values.

5. **Saving Cleaned Data**
   - Save the cleaned dataset into a new CSV file.

6. **Inserting Data into PostgreSQL**
   - Use `SQLAlchemy` and `psycopg2` to insert cleaned data into the database.

7. **Reading Data from the Database**
   - Retrieve data from PostgreSQL and export it to a CSV file.

8. **Database Table Structure**
   - The `Vehicle` table stores vehicle data, including ZIP codes, fuel types, model years, and geographic coordinates.

---
## Data Visualization

This part of the project utilizes cleaned data to create interactive visualizations. Key visualizations include:

- **Vehicle Age by Zip Code**: Analyzing vehicle age distribution.
- **Vehicle Count by Zip Code**: Visualizing the number of vehicles per ZIP code.
- **Make Distribution by Zip Code**: Showing vehicle make distribution.
- **Vehicle Count by Make**: Analyzing total vehicle numbers by make.
- **Fuel Type Distribution by Model Year**: Examining fuel type preferences over time.

### Libraries Used

- **Leaflet**
- **Leaflet MarkerCluster**
- **D3.js**
- **Highcharts**
- **Plotly.js**
- **Custom CSS (style.css)**
- **Custom JavaScript (app.js)**

### Files and Folder Structure

```
vehicle-analysis/
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
    └── Analysis_of_Vehicle_Count_By_Make_for_California/
        ├── index.html
        ├── style.css
        ├── app.js
        └── vehicle_cleaned.csv
```

### Accessing the Visualizations

- Open `index.html` in a web browser to view the interactive maps and charts.
- GitHub-hosted visualizations can be accessed here:
  - [Vehicle Count by Make](https://mctrashmoney.github.io/vehicle-analysis/visualizations/Analysis%20of%20Vehicle%20Count%20By%20Make%20for%20California%20State/)
  - [Vehicle Count by ZIP Code](https://mctrashmoney.github.io/vehicle-analysis/vehicle_count_zip/)
  - [Choropleth Map](https://mctrashmoney.github.io/vehicle-analysis/visualizations/Analysis_of_Zipcode_Make/Chropleth/)
  - [Heatmap](https://mctrashmoney.github.io/vehicle-analysis/visualizations/Analysis_of_Zipcode_Make/Heatmap/)
  - [Marker Cluster Map](https://mctrashmoney.github.io/vehicle-analysis/visualizations/Analysis_of_Zipcode_Make/Marker%20_Cluster%20_Map/)

---
## Ethical Considerations

1. **Privacy**
   - The dataset includes location information that could potentially identify individuals or businesses. It is recommended to generalize location data when sharing publicly.

2. **Informed Consent**
   - If personal vehicle information is used, individuals should be informed, and consent must be obtained.

3. **Data Accuracy**
   - Regular validation and cleaning ensure dataset integrity.

4. **Data Security**
   - Secure storage and sharing practices should be followed to prevent unauthorized access.

5. **Regulatory Compliance**
   - Ensure compliance with relevant data privacy regulations.

---
## Data Sources

- Vehicle data: [Data.gov](https://catalog.data.gov/dataset/vehicle-fuel-type-count-by-zip-code)
- Geographic data: Geocode API

## Code References

- Geocode API: [Documentation](https://geocode.xyz/)
- Visualization libraries: Leaflet, D3.js, Highcharts, Plotly.js
- Python libraries: pandas, psycopg2, SQLAlchemy

