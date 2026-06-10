# FloatChat FastAPI Backend - Supabase Integration
# Using Supabase Python client for database operations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from supabase import create_client, Client
import logging
import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio
import json
from datetime import datetime, date
import google.generativeai as genai
import os
import psycopg
from psycopg.rows import dict_row

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="FloatChat FastAPI Backend",
    description="Simple API for ARGO oceanographic data",
    version="1.0.0"
)

# Add CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Supabase connection
SUPABASE_URL = "https://qzazjhsvbhodoaplhrwm.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6YXpqaHN2YmhvZG9hcGxocndtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUxMDA0NywiZXhwIjoyMDczMDg2MDQ3fQ.5hBJyE3WddepHC5YWnX5fB_PEkdb67sScYVlFlMHXls"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Gemini AI setup
GEMINI_API_KEY = "AIzaSyDPQHjMcGS0BKyGOogt15-tmhaM5QN1ZqA"
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Database connection function using Supabase
def get_supabase_client():
    """Get Supabase client"""
    try:
        return supabase
    except Exception as e:
        logger.error(f"Supabase connection failed: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

def get_db_connection():
    """Get a direct PostgreSQL database connection."""
    database_url = (
        os.environ.get("DATABASE_URL")
        or os.environ.get("SUPABASE_DB_URL")
        or os.environ.get("PG_CONNECTION_STRING")
    )
    if not database_url:
        logger.error("Database connection string not configured in environment")
        raise HTTPException(status_code=500, detail="Database connection string not configured")
    try:
        return psycopg.connect(database_url)
    except Exception as e:
        logger.error(f"Failed to establish database connection: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# Pydantic models for requests/responses
class ProfileSearch(BaseModel):
    query_text: Optional[str] = None
    lat_min: Optional[float] = Field(None, ge=-90, le=90)
    lat_max: Optional[float] = Field(None, ge=-90, le=90)
    lon_min: Optional[float] = Field(None, ge=-180, le=180)
    lon_max: Optional[float] = Field(None, ge=-180, le=180)
    date_start: Optional[date] = None
    date_end: Optional[date] = None
    platform_numbers: Optional[List[str]] = None
    ocean_regions: Optional[List[str]] = None
    limit: int = Field(default=50, le=500)

class VectorQuery(BaseModel):
    embedding: List[float]
    top_k: int = Field(default=10, le=100)
    similarity_threshold: float = Field(default=0.7, ge=0.0, le=1.0)

class PlotRequest(BaseModel):
    profile_ids: List[int]
    plot_type: str
    parameters: Dict = {}
    format: str = "json"  # "json", "lightweight_html", "full_html", "data_only"

class NearestFloatsRequest(BaseModel):
    lat: float
    lon: float
    radius_km: int = 100
    limit: int = 10

class RegionTimeSearchRequest(BaseModel):
    region: str
    start_date: date
    end_date: date
    parameter: str = "temperature"
    limit: int = 50

# ============================================================================
# API ENDPOINTS - SIMPLE AND DIRECT
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("🏥 Health check started")
    try:
        # Test Supabase connection with a simple query
        logger.info("🏥 Testing Supabase connection...")
        result = supabase.table('profiles').select('profile_id').limit(1).execute()
        logger.info(f"🏥 Supabase query result: {result.data}")
        db_status = True
        logger.info("✅ Supabase health check successful")
    except Exception as e:
        db_status = False
        logger.error(f"❌ Supabase health check failed: {e}")
        logger.error(f"❌ Error type: {type(e)}")
    
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow(),
        "database_connected": db_status
    }

@app.get("/debug/profiles")
async def debug_profiles():
    """Debug endpoint to check profiles table content"""
    logger.info("🐛 Debug profiles endpoint called")
    try:
        # Get count of all profiles
        count_result = supabase.table('profiles').select('profile_id', count='exact').execute()
        total_count = count_result.count if hasattr(count_result, 'count') else len(count_result.data or [])
        logger.info(f"🐛 Total profiles count: {total_count}")
        
        # Get first 5 profiles
        result = supabase.table('profiles').select('profile_id, platform_number, latitude, longitude, profile_date').limit(5).execute()
        profiles = result.data or []
        logger.info(f"🐛 First 5 profiles: {profiles}")
        
        # Get profiles in our target area
        area_result = supabase.table('profiles').select('profile_id, platform_number, latitude, longitude, profile_date').gte('latitude', -44).lte('latitude', -42).gte('longitude', 34).lte('longitude', 36).execute()
        area_profiles = area_result.data or []
        logger.info(f"🐛 Profiles in target area (-44 to -42 lat, 34 to 36 lon): {len(area_profiles)} found")
        
        return {
            "total_profiles": total_count,
            "first_5_profiles": profiles,
            "target_area_profiles": area_profiles,
            "target_area_count": len(area_profiles)
        }
        
    except Exception as e:
        logger.error(f"❌ Debug profiles error: {e}")
        logger.error(f"❌ Error type: {type(e)}")
        raise HTTPException(status_code=500, detail=f"Debug failed: {str(e)}")

@app.post("/search_profiles")
async def search_profiles(search: ProfileSearch):
    """Search profiles with filters using Supabase"""
    logger.info(f"📋 Search profiles started")
    logger.info(f"📋 Search params: lat_min={search.lat_min}, lat_max={search.lat_max}, lon_min={search.lon_min}, lon_max={search.lon_max}")
    logger.info(f"📋 Search params: date_start={search.date_start}, date_end={search.date_end}, limit={search.limit}")
    logger.info(f"📋 Search params: query_text='{search.query_text}', platform_numbers={search.platform_numbers}")
    
    try:
        # Optimize: Reduce limit for faster queries and select only essential fields
        optimized_limit = min(search.limit, 20)  # Cap at 20 for performance
        logger.info(f"📋 Starting Supabase table query with optimized limit: {optimized_limit}")
        
        # Remove heavy summary_text field for faster queries - only select essential fields
        query = supabase.table('profiles').select('profile_id, platform_number, cycle_number, latitude, longitude, profile_date, ocean_region')
        logger.info(f"📋 Base query created with optimized field selection")
        
        # Apply filters
        filters_applied = []
        if search.lat_min is not None:
            query = query.gte('latitude', search.lat_min)
            filters_applied.append(f"lat_min >= {search.lat_min}")
        if search.lat_max is not None:
            query = query.lte('latitude', search.lat_max)
            filters_applied.append(f"lat_max <= {search.lat_max}")
        if search.lon_min is not None:
            query = query.gte('longitude', search.lon_min)
            filters_applied.append(f"lon_min >= {search.lon_min}")
        if search.lon_max is not None:
            query = query.lte('longitude', search.lon_max)
            filters_applied.append(f"lon_max <= {search.lon_max}")
        if search.date_start:
            query = query.gte('profile_date', search.date_start.isoformat())
            filters_applied.append(f"date_start >= {search.date_start.isoformat()}")
        if search.date_end:
            query = query.lte('profile_date', search.date_end.isoformat())
            filters_applied.append(f"date_end <= {search.date_end.isoformat()}")
        if search.platform_numbers:
            query = query.in_('platform_number', search.platform_numbers)
            filters_applied.append(f"platform_number in {search.platform_numbers}")
        if search.ocean_regions:
            # Use partial matching for ocean regions (ILIKE for each region)
            region_conditions = []
            for region in search.ocean_regions:
                # Create a temporary query to get profiles that contain the region name
                region_query = supabase.table('profiles').select('profile_id').ilike('ocean_region', f'%{region}%')
                region_conditions.append(region)
            
            # For now, use the first region with ILIKE for partial matching
            if region_conditions:
                query = query.ilike('ocean_region', f'%{region_conditions[0]}%')
                filters_applied.append(f"ocean_region contains '{region_conditions[0]}'")
        # Skip summary_text search since we removed that field for performance
        # if search.query_text:
        #     query = query.ilike('summary_text', f'%{search.query_text}%')
        #     filters_applied.append(f"summary_text contains '{search.query_text}'")
        
        logger.info(f"📋 Applied {len(filters_applied)} filters: {filters_applied}")
        
        # Apply ordering and optimized limit
        query = query.order('profile_date', desc=True).limit(optimized_limit)
        logger.info(f"📋 Applied ordering and optimized limit: {optimized_limit}")
        
        # Execute query
        logger.info(f"📋 Executing Supabase query...")
        result = query.execute()
        logger.info(f"📋 Query executed successfully")
        logger.info(f"📋 Result type: {type(result)}")
        logger.info(f"📋 Result data type: {type(result.data) if hasattr(result, 'data') else 'No data attr'}")
        logger.info(f"📋 Raw result data: {result.data}")
        
        profiles = result.data
        logger.info(f"📋 Profiles extracted: {len(profiles) if profiles else 0}")
        
        # Log first few profiles for debugging
        if profiles:
            for i, profile in enumerate(profiles[:3]):  # Log first 3 profiles
                logger.info(f"📋 Profile {i}: ID={profile.get('profile_id')}, lat={profile.get('latitude')}, lon={profile.get('longitude')}")
        
        # Ensure ocean_region is not null
        for profile in profiles:
            if profile.get('ocean_region') is None:
                profile['ocean_region'] = 'Unknown'
        
        logger.info(f"✅ Found {len(profiles)} profiles")
        return profiles
        
    except Exception as e:
        logger.error(f"❌ Profile search error: {e}")
        logger.error(f"❌ Error type: {type(e)}")
        logger.error(f"❌ Error details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/vector_search")
async def vector_search(query: VectorQuery):
    """Vector similarity search using Supabase RPC"""
    logger.info(f"🔍 Vector search started - embedding length: {len(query.embedding) if query.embedding else 'None'}")
    logger.info(f"🔍 Vector search params - threshold: {query.similarity_threshold}, top_k: {query.top_k}")
    
    try:
        # Log the RPC call details
        # Optimize: Cap vector search results for performance
        optimized_top_k = min(query.top_k, 15)  # Cap at 15 for performance
        
        rpc_params = {
            'query_embedding': query.embedding,
            'similarity_threshold': query.similarity_threshold,
            'match_count': optimized_top_k
        }
        logger.info(f"🔍 Calling Supabase RPC 'vector_search_profiles' with embedding length: {len(query.embedding)}")
        logger.info(f"🔍 RPC params (without embedding): threshold={query.similarity_threshold}, match_count={optimized_top_k}")
        
        # Use Supabase RPC for vector search
        result = supabase.rpc('vector_search_profiles', rpc_params).execute()
        
        logger.info(f"🔍 RPC call completed successfully")
        logger.info(f"🔍 RPC result type: {type(result)}")
        logger.info(f"🔍 RPC result data type: {type(result.data) if hasattr(result, 'data') else 'No data attr'}")
        logger.info(f"🔍 RPC result data: {result.data}")
        
        profiles = result.data or []
        logger.info(f"🔍 Processed profiles count: {len(profiles)}")
        
        # Ensure ocean_region is not null and format response
        for i, profile in enumerate(profiles):
            if profile.get('ocean_region') is None:
                profile['ocean_region'] = 'Unknown'
            logger.info(f"🔍 Profile {i}: {profile.get('profile_id', 'No ID')} - similarity: {profile.get('similarity_score', 'No score')}")
        
        logger.info(f"✅ Vector search returned {len(profiles)} profiles")
        return profiles
        
    except Exception as e:
        logger.error(f"❌ Vector search RPC error: {e}")
        logger.error(f"❌ Error type: {type(e)}")
        logger.error(f"❌ Error details: {str(e)}")
        
        # Fallback to regular search if vector search fails
        try:
            logger.info("🔄 Falling back to regular profile search")
            result = supabase.table('profiles').select('profile_id, platform_number, cycle_number, latitude, longitude, profile_date, summary_text, ocean_region').limit(query.top_k).execute()
            
            logger.info(f"🔄 Fallback query executed - result type: {type(result)}")
            logger.info(f"🔄 Fallback result data: {result.data}")
            
            profiles = result.data or []
            logger.info(f"🔄 Fallback returned {len(profiles)} profiles")
            
            for profile in profiles:
                if profile.get('ocean_region') is None:
                    profile['ocean_region'] = 'Unknown'
                profile['similarity_score'] = 0.5  # Default similarity
                
            logger.info(f"✅ Fallback search completed with {len(profiles)} profiles")
            return profiles
            
        except Exception as fallback_error:
            logger.error(f"❌ Fallback search also failed: {fallback_error}")
            logger.error(f"❌ Fallback error type: {type(fallback_error)}")
            raise HTTPException(status_code=500, detail=f"Vector search failed: {str(e)}")

@app.get("/measurements/{profile_id}")
async def get_measurements(profile_id: int):
    """Get measurements for a profile with time context - ENHANCED"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(row_factory=dict_row)
        
        # Enhanced query to include profile context and time information
        sql = """
            SELECT 
                m.depth, m.pressure, m.temperature, m.salinity, 
                m.oxygen, m.chlorophyll, m.ph, m.quality_flag,
                p.profile_date, p.platform_number, p.cycle_number,
                p.latitude, p.longitude, p.ocean_region
            FROM measurements m
            JOIN profiles p ON m.profile_id = p.profile_id
            WHERE m.profile_id = %s
            ORDER BY m.depth
        """
        
        cursor.execute(sql, [profile_id])
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            raise HTTPException(status_code=404, detail=f"Profile {profile_id} not found")
        
        # Extract profile metadata from first row
        first_row = rows[0]
        profile_info = {
            "profile_id": profile_id,
            "platform_number": first_row["platform_number"],
            "cycle_number": first_row["cycle_number"],
            "profile_date": first_row["profile_date"],
            "latitude": first_row["latitude"],
            "longitude": first_row["longitude"],
            "ocean_region": first_row["ocean_region"]
        }
        
        # Build measurements array with time context
        measurements = []
        for row in rows:
            measurements.append({
                "depth": row["depth"],
                "pressure": row["pressure"],
                "temperature": row["temperature"],
                "salinity": row["salinity"],
                "oxygen": row["oxygen"],
                "chlorophyll": row["chlorophyll"],
                "ph": row["ph"],
                "quality_flag": row["quality_flag"],
                "measurement_time": row["profile_date"]  # Time when this measurement was taken
            })
        
        logger.info(f"Retrieved {len(measurements)} measurements for profile {profile_id}")
        
        # Return enhanced response with profile context
        return {
            "profile": profile_info,
            "measurements": measurements,
            "total_measurements": len(measurements)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get measurements error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get measurements: {str(e)}")

@app.post("/plot_profiles")
async def generate_plots(plot_request: PlotRequest):
    """Generate plots using Supabase data"""
    logger.info(f"📊 Plot generation started for {len(plot_request.profile_ids)} profiles")
    logger.info(f"📊 Plot type: {plot_request.plot_type}, Format: {plot_request.format}")
    
    try:
        if not plot_request.profile_ids:
            raise HTTPException(status_code=400, detail="No profile IDs provided")
        
        # Get profile data from Supabase
        profiles_result = supabase.table('profiles').select('profile_id, platform_number, cycle_number').in_('profile_id', plot_request.profile_ids).execute()
        profiles_data = profiles_result.data or []
        
        if not profiles_data:
            raise HTTPException(status_code=404, detail="No profiles found for provided profile IDs")
        
        # Get measurements data from Supabase
        measurements_result = supabase.table('measurements').select('profile_id, depth, temperature, salinity, oxygen').in_('profile_id', plot_request.profile_ids).order('profile_id', desc=False).order('depth', desc=False).execute()
        measurements_data = measurements_result.data or []
        
        if not measurements_data:
            raise HTTPException(status_code=404, detail="No measurements found for provided profile IDs")
        
        logger.info(f"📊 Retrieved {len(profiles_data)} profiles and {len(measurements_data)} measurements")
        
        # Merge profile and measurement data
        plot_data = []
        for measurement in measurements_data:
            # Find corresponding profile
            profile = next((p for p in profiles_data if p['profile_id'] == measurement['profile_id']), None)
            if profile:
                plot_data.append({
                    'profile_id': measurement['profile_id'],
                    'platform_number': profile['platform_number'],
                    'cycle_number': profile['cycle_number'],
                    'depth': measurement['depth'],
                    'temperature': measurement['temperature'],
                    'salinity': measurement['salinity'],
                    'oxygen': measurement['oxygen']
                })
        
        if not plot_data:
            raise HTTPException(status_code=404, detail="No data found for provided profile IDs")
        
        # Convert to pandas DataFrame for plotting
        df = pd.DataFrame(plot_data)
        logger.info(f"📊 Created DataFrame with {len(df)} rows")
        
        # Generate plot based on type and format
        if plot_request.plot_type == "temperature" or plot_request.plot_type == "depth_profile":
            result = create_temperature_plot(df, plot_request.format)
        elif plot_request.plot_type == "salinity":
            result = create_salinity_plot(df, plot_request.format)
        elif plot_request.plot_type == "ts_diagram":
            result = create_ts_diagram(df, plot_request.format)
        else:
            result = create_temperature_plot(df, plot_request.format)  # Default
        
        logger.info(f"📊 Plot generation completed successfully")
        
        # Return appropriate response based on format
        if plot_request.format == "data_only":
            return {"data": result, "plot_type": plot_request.plot_type, "format": "data_only"}
        elif plot_request.format == "json":
            return {"plot_json": result, "plot_type": plot_request.plot_type, "format": "json"}
        else:
            return {"plot_html": result, "plot_type": plot_request.plot_type, "format": plot_request.format}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Plot generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Plot generation failed: {str(e)}")

@app.post("/plot_profiles_multiple")
async def generate_multiple_plots(multiple_plot_request: dict):
    """Generate multiple plots efficiently using Supabase data"""
    logger.info(f"📊 Multiple plot generation started")
    logger.info(f"📊 Request: {multiple_plot_request}")
    
    try:
        profile_ids = multiple_plot_request.get('profile_ids', [])
        plot_types = multiple_plot_request.get('plot_types', [])
        format_type = multiple_plot_request.get('format', 'json')
        
        if not profile_ids:
            raise HTTPException(status_code=400, detail="No profile IDs provided")
        
        if not plot_types:
            raise HTTPException(status_code=400, detail="No plot types provided")
        
        # Get profile and measurement data once (shared across all plots)
        logger.info(f"📊 Fetching data for {len(profile_ids)} profiles")
        
        # Get profile data from Supabase
        profiles_result = supabase.table('profiles').select('profile_id, platform_number, cycle_number').in_('profile_id', profile_ids).execute()
        profiles_data = profiles_result.data or []
        
        if not profiles_data:
            raise HTTPException(status_code=404, detail="No profiles found for provided profile IDs")
        
        # Get measurements data from Supabase
        measurements_result = supabase.table('measurements').select('profile_id, depth, temperature, salinity, oxygen').in_('profile_id', profile_ids).order('profile_id', desc=False).order('depth', desc=False).execute()
        measurements_data = measurements_result.data or []
        
        if not measurements_data:
            raise HTTPException(status_code=404, detail="No measurements found for provided profile IDs")
        
        # Merge profile and measurement data
        plot_data = []
        for measurement in measurements_data:
            # Find corresponding profile
            profile = next((p for p in profiles_data if p['profile_id'] == measurement['profile_id']), None)
            if profile:
                plot_data.append({
                    'profile_id': measurement['profile_id'],
                    'platform_number': profile['platform_number'],
                    'cycle_number': profile['cycle_number'],
                    'depth': measurement['depth'],
                    'temperature': measurement['temperature'],
                    'salinity': measurement['salinity'],
                    'oxygen': measurement['oxygen']
                })
        
        if not plot_data:
            raise HTTPException(status_code=404, detail="No data found for provided profile IDs")
        
        # Convert to pandas DataFrame
        df = pd.DataFrame(plot_data)
        logger.info(f"📊 Created DataFrame with {len(df)} rows for {len(plot_types)} plots")
        
        # Generate all requested plots
        plots = []
        successful_plots = 0
        
        for plot_type in plot_types:
            try:
                logger.info(f"📊 Generating {plot_type} plot")
                
                if plot_type == "temperature" or plot_type == "depth_profile":
                    result = create_temperature_plot(df, format_type)
                elif plot_type == "salinity":
                    result = create_salinity_plot(df, format_type)
                elif plot_type == "ts_diagram":
                    result = create_ts_diagram(df, format_type)
                else:
                    result = create_temperature_plot(df, format_type)  # Default
                
                plots.append({
                    "type": plot_type,
                    "data": result,
                    "format": format_type,
                    "success": True
                })
                successful_plots += 1
                logger.info(f"✅ {plot_type} plot generated successfully")
                
            except Exception as plot_error:
                logger.error(f"❌ Failed to generate {plot_type} plot: {plot_error}")
                plots.append({
                    "type": plot_type,
                    "data": None,
                    "format": format_type,
                    "success": False,
                    "error": str(plot_error)
                })
        
        logger.info(f"📊 Multiple plot generation completed: {successful_plots}/{len(plot_types)} successful")
        
        return {
            "plots": plots,
            "metadata": {
                "total_requested": len(plot_types),
                "successful": successful_plots,
                "failed": len(plot_types) - successful_plots,
                "profile_ids": profile_ids,
                "format": format_type
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Multiple plot generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Multiple plot generation failed: {str(e)}")

@app.get("/statistics/overview")
async def get_statistics():
    """Get dataset statistics - direct SQL queries"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(row_factory=dict_row)
        
        # Profile statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_profiles,
                COUNT(DISTINCT platform_number) as unique_floats,
                MIN(profile_date) as earliest_date,
                MAX(profile_date) as latest_date,
                COUNT(DISTINCT ocean_region) as ocean_regions
            FROM profiles
        """)
        profile_stats = cursor.fetchone()
        
        # Measurement statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_measurements,
                AVG(temperature) as avg_temperature,
                AVG(salinity) as avg_salinity,
                MAX(depth) as max_depth
            FROM measurements
            WHERE temperature IS NOT NULL
        """)
        measurement_stats = cursor.fetchone()
        
        conn.close()
        
        return {
            "profiles": dict(profile_stats),
            "measurements": dict(measurement_stats)
        }
        
    except Exception as e:
        logger.error(f"Statistics error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

# ============================================================================
# PS.md COMPLIANCE ENDPOINTS - Added for full requirement coverage
# ============================================================================

@app.post("/nearest_floats")
async def find_nearest_floats(request: NearestFloatsRequest):
    """Find nearest ARGO floats to a location - PS.md requirement"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(row_factory=dict_row)
        
        # Use Haversine formula for distance calculation
        sql = """
            SELECT 
                profile_id, platform_number, cycle_number, latitude, longitude,
                profile_date, ocean_region,
                (6371 * acos(cos(radians(%s)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians(%s)) + sin(radians(%s)) * 
                sin(radians(latitude)))) AS distance_km
            FROM profiles
            WHERE (6371 * acos(cos(radians(%s)) * cos(radians(latitude)) * 
                   cos(radians(longitude) - radians(%s)) + sin(radians(%s)) * 
                   sin(radians(latitude)))) <= %s
            ORDER BY distance_km
            LIMIT %s
        """
        
        cursor.execute(sql, [request.lat, request.lon, request.lat, request.lat, request.lon, request.lat, request.radius_km, request.limit])
        results = cursor.fetchall()
        conn.close()
        
        floats = []
        for row in results:
            floats.append({
                "profile_id": row["profile_id"],
                "platform_number": row["platform_number"],
                "cycle_number": row["cycle_number"],
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "profile_date": row["profile_date"],
                "ocean_region": row["ocean_region"],
                "distance_km": round(row["distance_km"], 2)
            })
        
        logger.info(f"Found {len(floats)} floats within {request.radius_km}km of ({request.lat}, {request.lon})")
        return floats
        
    except Exception as e:
        logger.error(f"Nearest floats error: {e}")
        raise HTTPException(status_code=500, detail=f"Nearest floats search failed: {str(e)}")

@app.post("/search_by_region_time")
async def search_by_region_and_time(request: RegionTimeSearchRequest):
    """Search profiles by region and time period - PS.md requirement"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(row_factory=dict_row)
        
        # Define region boundaries (simplified)
        region_bounds = {
            "equator": {"lat_min": -5, "lat_max": 5, "lon_min": -180, "lon_max": 180},
            "arabian_sea": {"lat_min": 10, "lat_max": 30, "lon_min": 50, "lon_max": 80},
            "indian_ocean": {"lat_min": -60, "lat_max": 30, "lon_min": 20, "lon_max": 120},
            "tropical_indian": {"lat_min": -10, "lat_max": 30, "lon_min": 40, "lon_max": 100}
        }
        
        bounds = region_bounds.get(request.region.lower())
        if not bounds:
            raise HTTPException(status_code=400, detail=f"Unknown region: {request.region}")
        
        sql = """
            SELECT DISTINCT p.profile_id, p.platform_number, p.cycle_number, 
                   p.latitude, p.longitude, p.profile_date, p.ocean_region
            FROM profiles p
            WHERE p.latitude BETWEEN %s AND %s
            AND p.longitude BETWEEN %s AND %s  
            AND p.profile_date BETWEEN %s AND %s
            ORDER BY p.profile_date DESC
            LIMIT %s
        """
        
        cursor.execute(sql, [
            bounds["lat_min"], bounds["lat_max"],
            bounds["lon_min"], bounds["lon_max"],
            request.start_date, request.end_date, request.limit
        ])
        results = cursor.fetchall()
        conn.close()
        
        profiles = [dict(row) for row in results]
        
        logger.info(f"Found {len(profiles)} profiles in {region} from {start_date} to {end_date}")
        return profiles
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Region-time search error: {e}")
        raise HTTPException(status_code=500, detail=f"Region-time search failed: {str(e)}")

@app.get("/bgc_parameters/{profile_id}")
async def get_bgc_parameters(profile_id: int):
    """Get BGC parameters for a profile - PS.md requirement"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(row_factory=dict_row)
        
        sql = """
            SELECT depth, oxygen, chlorophyll, ph, temperature, salinity
            FROM measurements
            WHERE profile_id = %s 
            AND (oxygen IS NOT NULL OR chlorophyll IS NOT NULL OR ph IS NOT NULL)
            ORDER BY depth
        """
        
        cursor.execute(sql, [profile_id])
        results = cursor.fetchall()
        conn.close()
        
        if not results:
            raise HTTPException(status_code=404, detail=f"No BGC data found for profile {profile_id}")
        
        bgc_data = []
        for row in results:
            bgc_data.append({
                "depth": row["depth"],
                "oxygen": row["oxygen"],
                "chlorophyll": row["chlorophyll"], 
                "ph": row["ph"],
                "temperature": row["temperature"],
                "salinity": row["salinity"]
            })
        
        logger.info(f"Retrieved {len(bgc_data)} BGC measurements for profile {profile_id}")
        return bgc_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"BGC parameters error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get BGC parameters: {str(e)}")

@app.get("/platform_trajectory/{platform_number}")
async def get_platform_trajectory(platform_number: str, limit: int = 100):
    """Get trajectory of an ARGO platform - PS.md requirement"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(row_factory=dict_row)
        
        sql = """
            SELECT cycle_number, latitude, longitude, profile_date
            FROM profiles
            WHERE platform_number = %s
            ORDER BY profile_date, cycle_number
            LIMIT %s
        """
        
        cursor.execute(sql, [platform_number, limit])
        results = cursor.fetchall()
        conn.close()
        
        if not results:
            raise HTTPException(status_code=404, detail=f"Platform {platform_number} not found")
        
        trajectory = []
        for row in results:
            trajectory.append({
                "cycle_number": row["cycle_number"],
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "profile_date": row["profile_date"]
            })
        
        logger.info(f"Retrieved trajectory with {len(trajectory)} points for platform {platform_number}")
        return {
            "platform_number": platform_number,
            "total_profiles": len(trajectory),
            "trajectory": trajectory
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Platform trajectory error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get platform trajectory: {str(e)}")

@app.get("/regional_stats")
async def get_regional_statistics(region: str, start_date: date, end_date: date):
    """Get statistics for a region and time period - PS.md requirement"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(row_factory=dict_row)
        
        # Regional statistics
        sql = """
            SELECT 
                COUNT(DISTINCT p.profile_id) as total_profiles,
                COUNT(DISTINCT p.platform_number) as unique_floats,
                AVG(m.temperature) as avg_temperature,
                AVG(m.salinity) as avg_salinity,
                AVG(m.oxygen) as avg_oxygen,
                MIN(p.profile_date) as earliest_profile,
                MAX(p.profile_date) as latest_profile
            FROM profiles p
            JOIN measurements m ON p.profile_id = m.profile_id
            WHERE p.ocean_region ILIKE %s
            AND p.profile_date BETWEEN %s AND %s
            AND m.temperature IS NOT NULL
        """
        
        cursor.execute(sql, [f"%{region}%", start_date, end_date])
        stats = cursor.fetchone()
        conn.close()
        
        if not stats or stats["total_profiles"] == 0:
            raise HTTPException(status_code=404, detail=f"No data found for region '{region}' in specified time period")
        
        regional_stats = {
            "region": region,
            "time_period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "statistics": dict(stats)
        }
        
        logger.info(f"Generated statistics for region '{region}' from {start_date} to {end_date}")
        return regional_stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Regional statistics error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get regional statistics: {str(e)}")

# ============================================================================
# SIMPLE PLOTTING FUNCTIONS
# ============================================================================

def create_temperature_plot(df, format="json"):
    """Create temperature vs depth plot in multiple formats"""
    
    # If data_only format, return raw data
    if format == "data_only":
        data = []
        for profile_id in df['profile_id'].unique():
            profile_data = df[df['profile_id'] == profile_id]
            valid_data = profile_data.dropna(subset=['temperature', 'depth'])
            if not valid_data.empty:
                data.append({
                    "profile_id": int(profile_id),
                    "platform_number": str(valid_data['platform_number'].iloc[0]),
                    "temperature": valid_data['temperature'].tolist(),
                    "depth": valid_data['depth'].tolist()
                })
        return data
    
    # Create Plotly figure
    fig = go.Figure()
    
    for profile_id in df['profile_id'].unique():
        profile_data = df[df['profile_id'] == profile_id]
        valid_data = profile_data.dropna(subset=['temperature', 'depth'])
        
        if not valid_data.empty:
            fig.add_trace(go.Scatter(
                x=valid_data['temperature'],
                y=valid_data['depth'],
                mode='lines+markers',
                name=f"Profile {profile_id} (Float {valid_data['platform_number'].iloc[0]})",
                hovertemplate='Depth: %{y}m<br>Temperature: %{x}°C<extra></extra>'
            ))
    
    fig.update_layout(
        title="Temperature Profiles",
        xaxis_title="Temperature (°C)",
        yaxis_title="Depth (m)",
        yaxis=dict(autorange='reversed'),
        template='plotly_white',
        width=800,
        height=600
    )
    
    # Return based on format
    if format == "json":
        return fig.to_json()
    elif format == "lightweight_html":
        return fig.to_html(include_plotlyjs='cdn')  # Use CDN instead of embedding
    else:  # full_html
        return fig.to_html(include_plotlyjs=True)

def create_salinity_plot(df, format="json"):
    """Create salinity vs depth plot in multiple formats"""
    
    # If data_only format, return raw data
    if format == "data_only":
        data = []
        for profile_id in df['profile_id'].unique():
            profile_data = df[df['profile_id'] == profile_id]
            valid_data = profile_data.dropna(subset=['salinity', 'depth'])
            if not valid_data.empty:
                data.append({
                    "profile_id": int(profile_id),
                    "platform_number": str(valid_data['platform_number'].iloc[0]),
                    "salinity": valid_data['salinity'].tolist(),
                    "depth": valid_data['depth'].tolist()
                })
        return data
    
    # Create Plotly figure
    fig = go.Figure()
    
    for profile_id in df['profile_id'].unique():
        profile_data = df[df['profile_id'] == profile_id]
        valid_data = profile_data.dropna(subset=['salinity', 'depth'])
        
        if not valid_data.empty:
            fig.add_trace(go.Scatter(
                x=valid_data['salinity'],
                y=valid_data['depth'],
                mode='lines+markers',
                name=f"Profile {profile_id} (Float {valid_data['platform_number'].iloc[0]})",
                hovertemplate='Depth: %{y}m<br>Salinity: %{x} PSU<extra></extra>'
            ))
    
    fig.update_layout(
        title="Salinity Profiles",
        xaxis_title="Salinity (PSU)",
        yaxis_title="Depth (m)",
        yaxis=dict(autorange='reversed'),
        template='plotly_white',
        width=800,
        height=600
    )
    
    # Return based on format
    if format == "json":
        return fig.to_json()
    elif format == "lightweight_html":
        return fig.to_html(include_plotlyjs='cdn')  # Use CDN instead of embedding
    else:  # full_html
        return fig.to_html(include_plotlyjs=True)

def create_ts_diagram(df, format="json"):
    """Create Temperature-Salinity diagram in multiple formats"""
    
    # If data_only format, return raw data
    if format == "data_only":
        data = []
        for profile_id in df['profile_id'].unique():
            profile_data = df[df['profile_id'] == profile_id]
            valid_data = profile_data.dropna(subset=['temperature', 'salinity'])
            if not valid_data.empty:
                data.append({
                    "profile_id": int(profile_id),
                    "platform_number": str(valid_data['platform_number'].iloc[0]),
                    "salinity": valid_data['salinity'].tolist(),
                    "temperature": valid_data['temperature'].tolist(),
                    "depth": valid_data['depth'].tolist()
                })
        return data
    
    # Create Plotly figure
    fig = go.Figure()
    
    for profile_id in df['profile_id'].unique():
        profile_data = df[df['profile_id'] == profile_id]
        valid_data = profile_data.dropna(subset=['temperature', 'salinity'])
        
        if not valid_data.empty:
            fig.add_trace(go.Scatter(
                x=valid_data['salinity'],
                y=valid_data['temperature'],
                mode='markers',
                name=f"Profile {profile_id}",
                marker=dict(
                    size=6,
                    color=valid_data['depth'],
                    colorscale='Viridis',
                    showscale=True,
                    colorbar=dict(title="Depth (m)")
                ),
                hovertemplate='Salinity: %{x} PSU<br>Temperature: %{y}°C<extra></extra>'
            ))
    
    fig.update_layout(
        title="Temperature-Salinity Diagram",
        xaxis_title="Salinity (PSU)",
        yaxis_title="Temperature (°C)",
        template='plotly_white',
        width=800,
        height=600
    )
    
    # Return based on format
    if format == "json":
        return fig.to_json()
    elif format == "lightweight_html":
        return fig.to_html(include_plotlyjs='cdn')  # Use CDN instead of embedding
    else:  # full_html
        return fig.to_html(include_plotlyjs=True)

# Run the application
if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get("PORT", 3000))
    reload = os.environ.get("ENVIRONMENT", "development") == "development"
    
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)
    print(f"🚀 FastAPI server running on http://localhost:{port}")