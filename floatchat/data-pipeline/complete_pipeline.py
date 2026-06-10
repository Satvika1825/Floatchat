from pathlib import Path
from dotenv import dotenv_values

# Import our components
from netCDF_to_csv_converter import argo_to_csv
from etl import run_etl

def main():
    
    # Get API key from .env file
    env = dotenv_values(".env")
    gemini_api_key = env.get("GEMINI_API_KEY")
    
    if not gemini_api_key:
        print("ERROR: Add GEMINI_API_KEY=your_key to .env file")
        return
    
    # Check NetCDF file exists
    netcdf_file = "data/20250101_prof.nc"
    if not Path(netcdf_file).exists():
        print(f"ERROR: {netcdf_file} not found")
        return
    
    print("Starting pipeline...")
    
    # Step 1: Convert NetCDF to CSV
    print("Step 1: Converting NetCDF to CSV...")
    csv_file = netcdf_file.replace('.nc', '_processed.csv')
    df = argo_to_csv(netcdf_file, csv_file)
    print(f"Converted {len(df)} rows to CSV")
    
    # Step 2: Process CSV to Database with AI
    print("Step 2: Processing to Database...")
    results = run_etl(csv_file, gemini_api_key)
    
    # Show results
    print(f"SUCCESS: Inserted {results['inserted_profiles']} profiles and {results['inserted_measurements']} measurements")
    print("Your data is now AI-searchable!")

if __name__ == "__main__":
    main()