# vehicle-analysis

This project processes and analyzes vehicle data, including extracting geographic coordinates (latitude and longitude) for each ZIP code. The data is cleaned, aggregated, and then inserted into a PostgreSQL database. The project uses various Python libraries including pandas, requests, psycopg2, and SQLAlchemy for handling CSV data, API calls, and database operations.

# Requirements

# Libraries

•	pandas: Data manipulation and cleaning.

•	requests: Making API calls to retrieve geographic data (latitude and longitude) for each ZIP code.

•	psycopg2: PostgreSQL database connector.

•	SQLAlchemy: ORM for managing PostgreSQL database operations.

•	json: Used for converting CSV data to JSON format.

•	csv: For reading and writing CSV files.

# Files

•	vehicle-fuel-type-count-by-zip-code-20231.csv: Original dataset containing vehicle fuel type data by ZIP code.

•	output_data.json: Intermediate JSON file containing vehicle data extracted from the CSV.

•	vehicle_cleaned_output.csv: Intermediate cleaned and processed data, after handling missing values and unwanted entries.

•	vehicle_cleaned.csv: Data from the PostgreSQL Database exported into csv file.

# Overview of Code Execution

# 1. Data Loading and CSV to JSON Conversion
The first step is to load the CSV file (vehicle-fuel-type-count-by-zip-code-20231.csv) and convert it into a JSON file (output_data.json). This JSON file contains the same vehicle data, but in JSON format.

# 2. Extracting ZIP Code and Fetching Latitude and Longitude
Using the requests library, the script makes API calls to https://geocode.xyz/{zip_code}?json=1 to retrieve the latitude and longitude for each unique ZIP code found in the data.

# 3. Adding Latitude and Longitude to the CSV Data
The latitude and longitude information is then merged with the original CSV data

# 4. Data Cleaning
The data is cleaned by dropping rows with missing or invalid values (such as 'Unk', 'OTHER/UNK', 'UNKNOWN', and '0'). The model_year column is also cleaned to replace entries starting with <2010 with the value 2009.

# 5. Saving Cleaned Data to CSV
The cleaned data is saved into a new CSV file (vehicle_cleaned_output.csv).

# 6. Inserting Data into PostgreSQL
The script then imports the cleaned data into a PostgreSQL database using SQLAlchemy and psycopg2. A Vehicle table is created with the relevant columns, and the cleaned data is inserted into this table.

# 7. Reading Data from the Database and saving it into csv file
The script retrieves data from the database and loads it into a DataFrame. The data in the DataFrame is then exported to a CSV file named vehicle_cleaned.csv

