#!/usr/bin/env python3
"""
Fast ETL: CSV → PostgreSQL + AI Embeddings
Converts oceanographic data into AI-searchable database with batch processing
"""

import pandas as pd
import numpy as np
import psycopg2
import psycopg2.extras
import google.generativeai as genai
from pathlib import Path
import time
import logging
from datetime import datetime

# Set up detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('etl.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Database connection
PROD_DB_URL = "postgresql://postgres:Jagadeeswar%4015@db.qzazjhsvbhodoaplhrwm.supabase.co:5432/postgres"

def load_csv(csv_file):
    """Load and clean CSV data"""
    logger.info(f"Loading CSV: {csv_file}")
    start_time = time.time()
    
    # Read CSV
    df = pd.read_csv(csv_file)
    logger.info(f"Loaded {len(df)} measurements in {time.time() - start_time:.2f}s")
    
    # Clean platform numbers (remove b' prefix)
    logger.info("Cleaning platform numbers...")
    df['platform_number'] = df['platform_number'].astype(str).str.replace("b'", "").str.replace("'", "").str.strip()
    
    # Convert date and ensure numeric types
    logger.info("Converting data types...")
    df['date'] = pd.to_datetime(df['date'])
    numeric_cols = ['latitude', 'longitude', 'depth', 'temperature', 'salinity']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Remove invalid data
    logger.info("Removing invalid data...")
    original_len = len(df)
    df = df.dropna(subset=['platform_number', 'cycle_number', 'latitude', 'longitude'])
    df = df[(df['latitude'] >= -90) & (df['latitude'] <= 90)]
    df = df[(df['longitude'] >= -180) & (df['longitude'] <= 180)]
    df = df[df['depth'] >= 0]
    
    removed_count = original_len - len(df)
    logger.info(f"Removed {removed_count} invalid rows, {len(df)} rows remaining")
    logger.info(f"Data loading completed in {time.time() - start_time:.2f}s")
    return df

def determine_ocean_region(lat, lon):
    """Determine ocean region from coordinates"""
    if -60 <= lat <= 30 and 20 <= lon <= 120:
        if lat >= -35:
            return "Indian Ocean - Tropical"
        else:
            return "Indian Ocean - Southern"
    elif lat > 30:
        return "Arabian Sea"
    elif lat < -60:
        return "Southern Ocean"
    else:
        return "Other Ocean"

def create_profiles(df):
    """Convert measurements into profiles with summaries - FAST VERSION"""
    logger.info("Creating profiles from measurements...")
    start_time = time.time()
    
    profiles = []
    
    # Group by platform + cycle (unique profiles)
    grouped = df.groupby(['platform_number', 'cycle_number'])
    logger.info(f"Found {len(grouped)} unique profiles to process")
    
    profile_count = 0
    for (platform, cycle), group in grouped:
        profile_count += 1
        
        if profile_count % 10 == 0:
            elapsed = time.time() - start_time
            logger.info(f"Processing profile {profile_count}/{len(grouped)} - {elapsed:.1f}s elapsed")
        
        # Skip profiles without essential data
        temp_data = group['temperature'].dropna()
        sal_data = group['salinity'].dropna()
        depth_data = group['depth'].dropna()
        
        if len(temp_data) == 0 or len(sal_data) == 0 or len(depth_data) == 0:
            logger.debug(f"Skipping profile {platform}-{cycle}: insufficient data")
            continue
        
        # Get basic info
        lat = float(group['latitude'].iloc[0])
        lon = float(group['longitude'].iloc[0])
        date = group['date'].iloc[0]
        
        # Determine ocean region
        ocean_region = determine_ocean_region(lat, lon)
        
        # Create descriptive summary
        summary_parts = [
            f"ARGO Float {platform}, Cycle {cycle}",
            f"Location: {lat:.3f}°N, {lon:.3f}°E",
            f"Region: {ocean_region}",
            f"Date: {date.strftime('%Y-%m-%d')}",
            f"Depth range: {depth_data.min():.1f}m to {depth_data.max():.1f}m",
            f"Temperature profile: {temp_data.min():.2f}°C to {temp_data.max():.2f}°C (mean: {temp_data.mean():.2f}°C)",
            f"Salinity profile: {sal_data.min():.3f} to {sal_data.max():.3f} PSU (mean: {sal_data.mean():.3f} PSU)"
        ]
        
        # Prepare measurements data
        measurements = []
        for _, row in group.iterrows():
            measurements.append({
                'depth': row.get('depth'),
                'pressure': row.get('pressure'), 
                'temperature': row.get('temperature'),
                'salinity': row.get('salinity'),
                'oxygen': row.get('oxygen'),
                'chlorophyll': row.get('chlorophyll'),
                'ph': row.get('ph'),
                'quality_flag': 1
            })
        
        profile = {
            'platform_number': str(platform),
            'cycle_number': int(cycle),
            'latitude': lat,
            'longitude': lon,
            'profile_date': date,
            'data_mode': 'R',
            'ocean_region': ocean_region,
            'summary_text': ". ".join(summary_parts),
            'measurements': measurements
        }
        profiles.append(profile)
    
    elapsed = time.time() - start_time
    logger.info(f"Created {len(profiles)} profiles in {elapsed:.2f}s")
    return profiles

def generate_embeddings_batch(texts, api_key, batch_size=5):
    """Generate embeddings in batches with detailed logging"""
    logger.info(f"Generating embeddings for {len(texts)} profiles...")
    
    genai.configure(api_key=api_key)
    embeddings = []
    failed_count = 0
    
    start_time = time.time()
    
    for i in range(0, len(texts), batch_size):
        batch_start = time.time()
        batch = texts[i:i + batch_size]
        batch_num = i // batch_size + 1
        total_batches = (len(texts) - 1) // batch_size + 1
        
        logger.info(f"Processing embedding batch {batch_num}/{total_batches} ({len(batch)} texts)")
        
        batch_embeddings = []
        for j, text in enumerate(batch):
            try:
                result = genai.embed_content(
                    model="models/embedding-001",
                    content=text,
                    task_type="retrieval_document",
                    output_dimensionality=768
                )
                batch_embeddings.append(result['embedding'])
                
            except Exception as e:
                logger.warning(f"Failed to generate embedding for text {i+j+1}: {e}")
                batch_embeddings.append(None)
                failed_count += 1
        
        embeddings.extend(batch_embeddings)
        
        batch_time = time.time() - batch_start
        total_time = time.time() - start_time
        avg_time_per_batch = total_time / batch_num
        remaining_batches = total_batches - batch_num
        estimated_remaining = remaining_batches * avg_time_per_batch
        
        logger.info(f"Batch {batch_num} completed in {batch_time:.2f}s. "
                   f"Estimated {estimated_remaining:.1f}s remaining")
        
        # Rate limiting
        if batch_num < total_batches:
            logger.debug("Rate limiting: waiting 2 seconds...")
            time.sleep(2)
    
    success_rate = ((len(embeddings) - failed_count) / len(embeddings)) * 100
    total_time = time.time() - start_time
    logger.info(f"Embedding generation completed: {success_rate:.1f}% success rate in {total_time:.2f}s")
    
    return embeddings

def insert_to_database_fast(profiles, api_key):
    """Fast database insertion with batch processing and detailed logging"""
    logger.info("Starting fast database insertion...")
    start_time = time.time()
    
    # Step 1: Generate embeddings for profiles that need them
    logger.info("Step 1: Generating embeddings...")
    embedding_start = time.time()
    
    texts = [profile['summary_text'] for profile in profiles]
    embeddings = generate_embeddings_batch(texts, api_key)
    
    embedding_time = time.time() - embedding_start
    logger.info(f"Embeddings generated in {embedding_time:.2f}s")
    
    # Add embeddings to profiles
    valid_profiles = []
    for i, profile in enumerate(profiles):
        if embeddings[i] is not None:
            profile['embedding'] = embeddings[i]
            valid_profiles.append(profile)
        else:
            logger.warning(f"Skipping profile {profile['platform_number']}-{profile['cycle_number']}: no embedding")
    
    logger.info(f"Step 2: Inserting {len(valid_profiles)} profiles with embeddings...")
    
    # Step 2: Connect to database
    db_start = time.time()
    logger.info("Connecting to database...")
    
    try:
        conn = psycopg2.connect(PROD_DB_URL)
        cursor = conn.cursor()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise
    
    # Step 3: Batch insert profiles
    logger.info("Step 3: Batch inserting profiles...")
    profile_insert_start = time.time()
    
    profile_data = []
    for profile in valid_profiles:
        profile_tuple = (
            profile['platform_number'],
            profile['cycle_number'],
            profile['latitude'],
            profile['longitude'],
            profile['profile_date'],
            profile['data_mode'],
            profile['ocean_region'],
            1,  # data_quality_flag
            profile['summary_text'],
            profile['embedding']
        )
        profile_data.append(profile_tuple)
    
    # Batch insert profiles using execute_values
    profile_insert_sql = """
        INSERT INTO profiles (
            platform_number, cycle_number, latitude, longitude,
            profile_date, data_mode, ocean_region, data_quality_flag,
            summary_text, embedding
        ) VALUES %s
        ON CONFLICT (platform_number, cycle_number) DO UPDATE SET
            updated_at = CURRENT_TIMESTAMP,
            summary_text = EXCLUDED.summary_text,
            embedding = EXCLUDED.embedding
        RETURNING profile_id, platform_number, cycle_number
    """
    
    try:
        psycopg2.extras.execute_values(
            cursor, profile_insert_sql, profile_data, 
            template=None, page_size=100
        )
        profile_results = cursor.fetchall()
        conn.commit()
        
        profile_insert_time = time.time() - profile_insert_start
        logger.info(f"Inserted {len(profile_results)} profiles in {profile_insert_time:.2f}s")
        
    except Exception as e:
        logger.error(f"Profile insertion failed: {e}")
        conn.rollback()
        raise
    
    # Step 4: Prepare measurements for batch insert
    logger.info("Step 4: Preparing measurements for batch insert...")
    measurement_prep_start = time.time()
    
    # Create profile ID mapping
    profile_id_map = {(row[1], row[2]): row[0] for row in profile_results}
    
    # Prepare all measurements for batch insert
    measurement_data = []
    for profile in valid_profiles:
        profile_key = (profile['platform_number'], profile['cycle_number'])
        if profile_key in profile_id_map:
            profile_id = profile_id_map[profile_key]
            
            for measurement in profile['measurements']:
                measurement_tuple = (
                    profile_id,
                    measurement.get('depth'),
                    measurement.get('pressure'),
                    measurement.get('temperature'),
                    measurement.get('salinity'),
                    measurement.get('oxygen'),
                    measurement.get('chlorophyll'),
                    measurement.get('ph'),
                    measurement.get('quality_flag', 1)
                )
                measurement_data.append(measurement_tuple)
    
    measurement_prep_time = time.time() - measurement_prep_start
    logger.info(f"Prepared {len(measurement_data)} measurements in {measurement_prep_time:.2f}s")
    
    # Step 5: Clear existing measurements and batch insert new ones
    logger.info("Step 5: Inserting measurements...")
    measurement_insert_start = time.time()
    
    # Clear existing measurements for these profiles
    logger.info("Clearing existing measurements...")
    cursor.execute("DELETE FROM measurements WHERE profile_id IN %s", 
                  (tuple(profile_id_map.values()),))
    
    # Batch insert measurements in chunks
    measurement_insert_sql = """
        INSERT INTO measurements (
            profile_id, depth, pressure, temperature, salinity,
            oxygen, chlorophyll, ph, quality_flag
        ) VALUES %s
    """
    
    chunk_size = 1000
    total_chunks = (len(measurement_data) - 1) // chunk_size + 1
    
    for i in range(0, len(measurement_data), chunk_size):
        chunk_start = time.time()
        chunk = measurement_data[i:i + chunk_size]
        chunk_num = i // chunk_size + 1
        
        logger.info(f"Inserting measurement chunk {chunk_num}/{total_chunks} ({len(chunk)} measurements)")
        
        try:
            psycopg2.extras.execute_values(
                cursor, measurement_insert_sql, chunk,
                template=None, page_size=100
            )
            conn.commit()
            
            chunk_time = time.time() - chunk_start
            logger.info(f"Chunk {chunk_num} inserted in {chunk_time:.2f}s")
            
        except Exception as e:
            logger.error(f"Measurement chunk {chunk_num} insertion failed: {e}")
            conn.rollback()
            raise
    
    measurement_insert_time = time.time() - measurement_insert_start
    logger.info(f"All measurements inserted in {measurement_insert_time:.2f}s")
    
    # Close connection
    conn.close()
    
    # Summary
    total_time = time.time() - start_time
    logger.info("=== ETL COMPLETION SUMMARY ===")
    logger.info(f"Total profiles inserted: {len(profile_results)}")
    logger.info(f"Total measurements inserted: {len(measurement_data)}")
    logger.info(f"Total time: {total_time:.2f}s")
    logger.info(f"  - Embeddings: {embedding_time:.2f}s ({embedding_time/total_time*100:.1f}%)")
    logger.info(f"  - Profile insertion: {profile_insert_time:.2f}s ({profile_insert_time/total_time*100:.1f}%)")
    logger.info(f"  - Measurement insertion: {measurement_insert_time:.2f}s ({measurement_insert_time/total_time*100:.1f}%)")
    
    return {
        'status': 'success',
        'processing_time': f'{total_time:.2f} seconds',
        'inserted_profiles': len(profile_results),
        'inserted_measurements': len(measurement_data),
        'database_url': 'Production Supabase'
    }

def run_etl(csv_file, gemini_api_key):
    """Run the complete ETL pipeline with detailed logging"""
    logger.info("=== STARTING FAST ETL PIPELINE ===")
    pipeline_start = time.time()
    
    try:
        # Step 1: Load CSV data
        df = load_csv(csv_file)
        
        # Step 2: Create profiles
        profiles = create_profiles(df)
        
        # Step 3: Insert to database with batch processing
        results = insert_to_database_fast(profiles, gemini_api_key)
        
        pipeline_time = time.time() - pipeline_start
        logger.info(f"=== ETL PIPELINE COMPLETED SUCCESSFULLY in {pipeline_time:.2f}s ===")
        
        return results
        
    except Exception as e:
        pipeline_time = time.time() - pipeline_start
        logger.error(f"=== ETL PIPELINE FAILED after {pipeline_time:.2f}s ===")
        logger.error(f"Error: {e}")
        raise

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python etl.py <csv_file> <gemini_api_key>")
        print("Example: python etl.py data/indian_20250101_prof.csv your_api_key")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    api_key = sys.argv[2]
    
    try:
        results = run_etl(csv_file, api_key)
        print(f"\n✅ ETL completed successfully!")
        print(f"Profiles: {results['inserted_profiles']}")
        print(f"Measurements: {results['inserted_measurements']}")
        print(f"Time: {results['processing_time']}")
        
    except Exception as e:
        print(f"\n❌ ETL failed: {e}")
        sys.exit(1)