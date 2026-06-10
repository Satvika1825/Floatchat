# FloatChat FastAPI Testing Guide

## 🆕 NEW: Multiple Plot Support
**NEW ENDPOINT:** `/plot_profiles_multiple` - Generate multiple plots efficiently in a single request
**Benefits:** Single database fetch, parallel processing, graceful error handling

## 🚀 Server Setup
**PORT:** 3000 (as defined in main.py)
**Start server:** `cd backend/fastapi && python main.py`
**Base URL:** `http://localhost:3000/`
**Valid Profile IDs:** 8, 9, 10, 11, 12 (not 1, 2, 3)

---

## 📋 API Endpoint Tests

### 1. Health Check

**curl command:**
```bash
curl -s http://localhost:3000/health
```

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-11T15:52:38.403650",
  "database_connected": true
}
```

### 2. Search Profiles (Basic)

**curl command:**
```bash
curl -s -X POST http://localhost:3000/search_profiles -H "Content-Type: application/json" -d '{"limit": 5}'
```

**Example Response:**
```json
[
  {
    "profile_id": 70,
    "platform_number": "5906527",
    "cycle_number": 94,
    "latitude": -43.513,
    "longitude": 35.468,
    "profile_date": "2025-01-01T23:10:46",
    "summary_text": "ARGO Float 5906527, Cycle 94. Location: -43.513°N, 35.468°E. Region: Indian Ocean - Southern. Date: 2025-01-01. Depth range: 4.4m to 1598.2m. Temperature profile: 2.77°C to 10.85°C (mean: 5.51°C). Salinity profile: 34.021 to 34.694 PSU (mean: 34.277 PSU)",
    "ocean_region": "Indian Ocean - Southern"
  },
  {
    "profile_id": 54,
    "platform_number": "5905521",
    "cycle_number": 96,
    "latitude": -8.2485,
    "longitude": 105.7938,
    "profile_date": "2025-01-01T22:30:06",
    "summary_text": "ARGO Float 5905521, Cycle 96. Location: -8.248°N, 105.794°E. Region: Indian Ocean - Tropical. Date: 2025-01-01. Depth range: 4.1m to 2003.7m. Temperature profile: 2.55°C to 28.79°C (mean: 7.71°C). Salinity profile: 34.171 to 35.033 PSU (mean: 34.705 PSU)",
    "ocean_region": "Indian Ocean - Tropical"
  }
]
```

1. Search Profiles (With Filters)

POST http://localhost:3000/search_profiles
Content-Type: application/json

{
"lat_min": 10.0,
"lat_max": 20.0,
"lon_min": 50.0,
"lon_max": 80.0,
"limit": 10
}

1. Search Profiles (With Text)

POST http://localhost:3000/search_profiles
Content-Type: application/json

{
"query_text": "Indian Ocean",
"limit": 5
}

5. Get Measurements (Enhanced with Time Context)

GET http://localhost:3000/measurements/8
Replace 8 with an actual profile_id from search results (valid IDs: 8, 9, 10, 11, 12)

**Enhanced Response Format:**
```json
{
  "profile": {
    "profile_id": 1,
    "platform_number": "5906527",
    "cycle_number": 94,
    "profile_date": "2025-01-01T12:00:00",
    "latitude": -43.513,
    "longitude": 35.468,
    "ocean_region": "Indian Ocean - Southern"
  },
  "measurements": [
    {
      "depth": 4.4,
      "pressure": 4.5,
      "temperature": 10.85,
      "salinity": 33.876,
      "oxygen": null,
      "chlorophyll": null,
      "ph": null,
      "quality_flag": 1,
      "measurement_time": "2025-01-01T12:00:00"
    }
  ],
  "total_measurements": 645
}
```

1. Generate Temperature Plot (JSON Format - Default)

POST http://localhost:3000/plot_profiles
Content-Type: application/json

{
"profile_ids": [8, 9],
"plot_type": "temperature",
"format": "json"
}

1a. Generate Temperature Plot (Lightweight HTML - CDN)

POST http://localhost:3000/plot_profiles
Content-Type: application/json

{
"profile_ids": [8, 9],
"plot_type": "temperature",
"format": "lightweight_html"
}

### 6b. Generate Temperature Plot (Data Only - No Plot)

**curl command:**
```bash
curl -s -X POST http://localhost:3000/plot_profiles -H "Content-Type: application/json" -d '{"profile_ids": [8, 9], "plot_type": "temperature", "format": "data_only"}'
```

**Example Response:**
```json
{
  "data": [
    {
      "profile_id": 8,
      "platform_number": "1901743",
      "temperature": [3.87, 3.87, 3.88, 3.88, ...],
      "depth": [4.49, 5.98, 7.95, 9.96, ...]
    },
    {
      "profile_id": 9,
      "platform_number": "1901897", 
      "temperature": [25.26, 25.25, 25.24, ...],
      "depth": [23.6, 33.4, 43.6, ...]
    }
  ],
  "plot_type": "temperature",
  "format": "data_only"
}
```

1c. Generate Temperature Plot (Full HTML - 4.5MB+)

POST http://localhost:3000/plot_profiles
Content-Type: application/json

{
"profile_ids": [8, 9],
"plot_type": "temperature",
"format": "full_html"
}

1. Generate Salinity Plot (JSON Format - Default)

POST http://localhost:3000/plot_profiles
Content-Type: application/json

{
"profile_ids": [8, 9],
"plot_type": "salinity",
"format": "json"
}

1. Generate T-S Diagram (JSON Format - Default)

POST http://localhost:3000/plot_profiles
Content-Type: application/json

{
"profile_ids": [8, 9],
"plot_type": "ts_diagram",
"format": "json"
}

### 7.5. 🆕 NEW: Multiple Plot Generation (Efficient)

**ENDPOINT:** `/plot_profiles_multiple`  
**METHOD:** POST  
**PURPOSE:** Generate multiple plots in a single efficient request

**curl command:**
```bash
curl -s -X POST http://localhost:3000/plot_profiles_multiple \
-H "Content-Type: application/json" \
-d '{
  "profile_ids": [8, 9],
  "plot_types": ["temperature", "salinity", "ts_diagram"],
  "format": "json"
}'
```

**Request Body:**
```json
{
  "profile_ids": [8, 9],
  "plot_types": ["temperature", "salinity", "ts_diagram"],
  "format": "json"
}
```

**Example Response:**
```json
{
  "plots": [
    {
      "type": "temperature",
      "data": {...plotly_json_data...},
      "format": "json",
      "success": true
    },
    {
      "type": "salinity", 
      "data": {...plotly_json_data...},
      "format": "json",
      "success": true
    },
    {
      "type": "ts_diagram",
      "data": {...plotly_json_data...},
      "format": "json", 
      "success": true
    }
  ],
  "metadata": {
    "total_requested": 3,
    "successful": 3,
    "failed": 0,
    "profile_ids": [8, 9],
    "format": "json"
  }
}
```

**Benefits:**
- ⚡ **Single database fetch** shared across all plots
- 🔄 **Parallel processing** of multiple plot types  
- 🛡️ **Graceful error handling** - partial success supported
- 📊 **Consistent data** - all plots use same profile data
- 🚀 **Better performance** compared to multiple individual requests

### 8. Get Dataset Statistics

**curl command:**
```bash
curl -s http://localhost:3000/statistics/overview
```

**Example Response:**
```json
{
  "profiles": {
    "total_profiles": 77,
    "unique_floats": 75,
    "earliest_date": "2025-01-01T00:08:54",
    "latest_date": "2025-01-01T23:10:46",
    "ocean_regions": 4
  },
  "measurements": {
    "total_measurements": 49619,
    "avg_temperature": 7.54,
    "avg_salinity": 34.45,
    "max_depth": 4952.3
  }
}
```

10. Vector Search (If you have embeddings)

POST http://localhost:3000/vector_search
Content-Type: application/json

{
"embedding": [0.1, 0.2, 0.3, ... (768 numbers)],
"top_k": 5,
"similarity_threshold": 0.7
}

## 🆕 PS.md Compliance Endpoints (NEW)

### 11. Find Nearest ARGO Floats ✅ FIXED

**curl command:**
```bash
curl -s -X POST http://localhost:3000/nearest_floats -H "Content-Type: application/json" -d '{"lat": 15.0, "lon": 65.0, "radius_km": 200, "limit": 3}'
```

**Example Response:**
```json
[]
```
**Note:** Empty array indicates no ARGO floats found within 200km of coordinates (15°N, 65°E). Try larger radius or different coordinates.
**Status:** ✅ Fixed - Parameter references updated, now works properly

### 12. Search by Region and Time Period ✅ FIXED
```
POST http://localhost:3000/search_by_region_time
Content-Type: application/json

{
  "region": "equator",
  "start_date": "2023-03-01",
  "end_date": "2023-03-31",
  "parameter": "salinity",
  "limit": 20
}
```
**Supported Regions:** `equator`, `arabian_sea`, `indian_ocean`, `tropical_indian`
**Status:** ✅ Fixed - Now accepts JSON body properly

### 13. Search Arabian Sea (PS.md Example)
```
POST http://localhost:3000/search_by_region_time
Content-Type: application/json

{
  "region": "arabian_sea", 
  "start_date": "2023-06-01",
  "end_date": "2023-12-31",
  "limit": 15
}
```

### 14. Get BGC Parameters

**curl command:**
```bash
curl -s http://localhost:3000/bgc_parameters/8
```

**Example Response:**
```json
{
  "detail": "No BGC data found for profile 8"
}
```
**Note:** Most profiles don't have BGC data. This is expected - only specialized floats collect bio-geochemical parameters.
**Replace `8` with actual profile_id (valid IDs: 8, 9, 10, 11, 12)**

### 15. Get Platform Trajectory
```
GET http://localhost:3000/platform_trajectory/5906527
```
**Replace with actual platform_number from search results**
**Expected Response:** Trajectory with lat/lon points over time

### 16. Regional Statistics
```
GET http://localhost:3000/regional_stats?region=Indian%20Ocean&start_date=2023-01-01&end_date=2023-12-31
```
**Expected Response:** Regional statistics for time period

## 🚀 Server Information

**Server runs on PORT 3000** (as defined in main.py)
- Start server: `cd backend/fastapi && python main.py` 
- All endpoints use: `http://localhost:3000/`
- Valid Profile IDs for testing: **8, 9, 10, 11, 12** (not 1, 2, 3)