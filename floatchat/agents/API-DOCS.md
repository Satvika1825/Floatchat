# FloatChat API Documentation

Complete API reference for the FloatChat AI-powered oceanographic data discovery system.

## 🌐 Base URL

```
Production: https://floatchat-agents.vercel.app
```

## 🔐 Authentication

No authentication required for public endpoints. All endpoints are open access.

## 📋 Request/Response Format

- **Content-Type**: `application/json`
- **Response Format**: JSON
- **Max Request Size**: 10MB

---

# 🚀 Core API Endpoints

## 1. Health Check

### `GET /health`

Check system status and connectivity.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

**Status Codes:**
- `200` - System healthy
- `503` - System unavailable

---

## 2. Session Management

### `POST /new_session`

Create a new conversation session for context tracking.

**Request:**
```http
POST /new_session
Content-Type: application/json

{}
```

**Response:**
```json
{
  "sessionId": "session_uuid_12345",
  "created_at": "2024-01-15T10:30:00.000Z",
  "status": "created"
}
```

**Status Codes:**
- `201` - Session created successfully
- `500` - Failed to create session

---

## 3. Main Query Processing

### `POST /query`

Main endpoint for oceanographic data queries with AI processing.

**Request:**
```http
POST /query
Content-Type: application/json

{
  "question": "Show me temperature profiles in the Arabian Sea",
  "sessionId": "session_uuid_12345",
  "options": {
    "max_results": 10,
    "use_cache": true
  },
  "geographic_bounds": {
    "lat_min": 10.0,
    "lat_max": 25.0,
    "lon_min": 50.0,
    "lon_max": 80.0
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | string | ✅ | Natural language query (max 1000 chars) |
| `sessionId` | string | ❌ | Session ID for conversation context |
| `options` | object | ❌ | Query configuration options |
| `options.max_results` | number | ❌ | Maximum profiles to return (default: 20, max: 50) |
| `options.use_cache` | boolean | ❌ | Enable result caching (default: true) |
| `geographic_bounds` | object | ❌ | Geographic area selection from map |
| `geographic_bounds.lat_min` | number | ❌ | Minimum latitude (-90 to 90) |
| `geographic_bounds.lat_max` | number | ❌ | Maximum latitude (-90 to 90) |
| `geographic_bounds.lon_min` | number | ❌ | Minimum longitude (-180 to 180) |
| `geographic_bounds.lon_max` | number | ❌ | Maximum longitude (-180 to 180) |

**Response:**
```json
{
  "response": "I found 12 temperature profiles in the Arabian Sea. The data shows typical tropical waters with surface temperatures around 28-30°C decreasing to 15°C at 200m depth...",
  "profiles": [
    {
      "profile_id": 12345,
      "platform_number": "5906467",
      "cycle_number": 125,
      "latitude": 15.234,
      "longitude": 65.789,
      "profile_date": "2024-01-10",
      "ocean_region": "Arabian Sea"
    }
  ],
  "visualization": {
    "plots": [
      {
        "type": "temperature",
        "data": { /* Plotly JSON data */ },
        "title": "Temperature Profiles (12 profiles)",
        "reasoning": "Temperature analysis requested"
      }
    ],
    "metadata": {
      "totalPlots": 1,
      "profileIds": [12345, 12346],
      "analysisType": "single"
    }
  },
  "sessionId": "session_uuid_12345",
  "metadata": {
    "query_interpretation": {
      "intent": "search",
      "parameters": {
        "variables": ["temperature"],
        "ocean_region": "Arabian Sea"
      },
      "confidence": 0.89
    },
    "total_profiles": 12,
    "search_method": "structured",
    "processing_time": 3240,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `200` - Query processed successfully
- `400` - Invalid request parameters
- `429` - Rate limit exceeded
- `500` - Processing error

**Example Queries:**
```javascript
// Geographic query
{
  "question": "Show me salinity profiles near the equator in March 2023"
}

// Comparison query
{
  "question": "Compare BGC parameters in Arabian Sea for last 6 months",
  "sessionId": "session_123"
}

// Map-based query
{
  "question": "What's the water temperature like here?",
  "geographic_bounds": {
    "lat_min": -45.0, "lat_max": -40.0,
    "lon_min": 30.0, "lon_max": 40.0
  }
}

// Follow-up query with context
{
  "question": "What about oxygen levels for the same area?",
  "sessionId": "session_123"
}
```

---

## 4. Chat History

### `GET /chat_history/{sessionId}`

Retrieve conversation history for a session.

**Request:**
```http
GET /chat_history/session_uuid_12345?limit=10
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | ✅ | Session identifier |
| `limit` | number | ❌ | Max messages to return (default: 10, max: 50) |

**Response:**
```json
{
  "sessionId": "session_uuid_12345",
  "messages": [
    {
      "id": "msg_001",
      "user_question": "Show me temperature data near India",
      "ai_response": "I found 15 temperature profiles...",
      "timestamp": "2024-01-15T10:25:00.000Z",
      "metadata": {
        "profiles_found": 15,
        "visualization_type": "temperature",
        "processing_time": 2340
      }
    }
  ],
  "total_messages": 5,
  "created_at": "2024-01-15T09:00:00.000Z"
}
```

**Status Codes:**
- `200` - History retrieved successfully
- `404` - Session not found
- `500` - Retrieval error

---

## 5. Conversation Export

### `GET /export_conversation/{sessionId}`

Export conversation history in various formats.

**Request:**
```http
GET /export_conversation/session_uuid_12345?format=json
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | ✅ | Session identifier |
| `format` | string | ❌ | Export format: `json`, `csv`, `txt` (default: json) |

**Response (JSON format):**
```json
{
  "sessionId": "session_uuid_12345",
  "exported_at": "2024-01-15T10:30:00.000Z",
  "total_messages": 5,
  "conversation": [
    {
      "timestamp": "2024-01-15T10:25:00.000Z",
      "user": "Show me temperature data near India",
      "assistant": "I found 15 temperature profiles...",
      "profiles_count": 15,
      "visualization_generated": true
    }
  ],
  "summary": {
    "topics_discussed": ["temperature", "visualization", "India"],
    "total_profiles_analyzed": 45,
    "visualizations_created": 3
  }
}
```

**Response (CSV format):**
```csv
timestamp,user_question,ai_response,profiles_count,processing_time
2024-01-15T10:25:00.000Z,"Show me temperature data near India","I found 15 temperature profiles...",15,2340
```

**Status Codes:**
- `200` - Export completed successfully
- `404` - Session not found
- `400` - Invalid format specified
- `500` - Export error

---

# 🔍 Query Processing Pipeline

## Multi-Agent Architecture

The `/query` endpoint processes requests through a sophisticated multi-agent pipeline:

### 1. Query Agent
- **Purpose**: Natural language interpretation with geographic context
- **Input**: User question + conversation history + map bounds
- **Output**: Structured parameters and search intent

### 2. Data Retrieval Agent  
- **Purpose**: Multi-strategy data fetching with optimizations
- **Strategies**: Structured search, vector search, region-based search
- **Output**: ARGO profile data with metadata

### 3. Visualization Agent
- **Purpose**: Intelligent plot generation and selection
- **Capabilities**: Multiple plot types, smart recommendations
- **Output**: Plotly visualizations in JSON format

### 4. Response Agent
- **Purpose**: Context-aware response generation
- **Features**: Conversation continuity, geographic analysis
- **Output**: Natural language response with insights

---

# 🗺️ Geographic Query Support

## Map-Based Queries

The system supports interactive map selections through `geographic_bounds`:

```json
{
  "question": "Analyze this ocean region",
  "geographic_bounds": {
    "lat_min": -45.0,
    "lat_max": -40.0,
    "lon_min": 30.0,
    "lon_max": 40.0
  }
}
```

**Features:**
- **Ocean Region Detection**: Automatically identifies Southern Ocean, Arabian Sea, etc.
- **Oceanographic Context**: Region-specific insights and water mass analysis
- **Area Calculations**: Center point, coverage area, search radius
- **Coordinate Validation**: Ensures valid lat/lon ranges

**Supported Regions:**
- Southern Ocean
- Indian Ocean  
- Arabian Sea
- Equatorial regions
- Tropical Indian Ocean
- Custom coordinate bounds

---

# 📊 Visualization Types

## Available Plot Types

| Type | Description | Data Requirements |
|------|-------------|-------------------|
| `temperature` | Temperature vs depth profiles | Temperature + Depth |
| `salinity` | Salinity vs depth profiles | Salinity + Depth |
| `ts_diagram` | Temperature-Salinity scatter | Temperature + Salinity |
| `depth_profile` | General depth profile analysis | Any parameter + Depth |
| `oxygen` | Oxygen vs depth profiles | Oxygen + Depth |
| `multiple` | Combination of multiple plots | Variable requirements |

## Visualization Response Format

```json
{
  "visualization": {
    "plots": [
      {
        "type": "temperature",
        "data": {
          "data": [{ /* Plotly trace data */ }],
          "layout": { /* Plotly layout config */ }
        },
        "title": "Temperature Profiles (5 profiles)",
        "reasoning": "Temperature analysis requested",
        "priority": 2
      }
    ],
    "metadata": {
      "totalPlots": 1,
      "profileIds": [123, 456, 789],
      "analysisType": "single"
    }
  }
}
```

---

# 💾 Session & Caching

## Session Management

**Session Lifecycle:**
1. Create session with `POST /new_session`
2. Include `sessionId` in subsequent queries
3. System maintains conversation context
4. Sessions expire after 24 hours of inactivity

**Context Features:**
- **Conversation History**: Last 10 messages for context
- **Geographic Memory**: Remembers previous search areas  
- **Topic Tracking**: Maintains discussion themes
- **Pattern Recognition**: Detects follow-up questions

## Caching Strategy

**Cache Behavior:**
- **Cache Key**: Generated from question + options
- **TTL**: 1 hour for query results
- **Storage**: Firebase Firestore
- **Hit Rate**: ~40% for similar queries

**Cache Control:**
```json
{
  "options": {
    "use_cache": false  // Disable caching for fresh results
  }
}
```

---

# ⚡ Performance & Limits

## Response Times

| Component | Typical Time | Max Time |
|-----------|--------------|----------|
| Query Agent | ~500ms | 2s |
| Data Retrieval | ~1-2s | 5s |
| Visualization | ~1s | 3s |
| Response Agent | ~800ms | 2s |
| **Total Pipeline** | **3-5s** | **10s** |

## Rate Limits

| Endpoint | Rate Limit | Window |
|----------|------------|---------|
| `/query` | 30 requests | 1 minute |
| `/new_session` | 10 requests | 1 minute |
| `/chat_history/*` | 60 requests | 1 minute |
| `/export_conversation/*` | 5 requests | 1 minute |

## Data Limits

| Parameter | Limit |
|-----------|--------|
| Question length | 1,000 characters |
| Max results per query | 50 profiles |
| Chat history retrieval | 50 messages |
| Session duration | 24 hours |
| Request size | 10MB |

---

# 🔧 Error Handling

## Error Response Format

```json
{
  "error": true,
  "message": "Invalid geographic bounds: latitude must be between -90 and 90",
  "code": "INVALID_COORDINATES",
  "details": {
    "parameter": "lat_min",
    "provided_value": 95.0,
    "valid_range": "(-90, 90)"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_QUESTION` | 400 | Question too long or empty |
| `INVALID_SESSION` | 404 | Session ID not found |
| `INVALID_COORDINATES` | 400 | Geographic bounds out of range |
| `PROCESSING_ERROR` | 500 | Agent pipeline failure |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `NO_DATA_FOUND` | 200 | Query processed but no results |
| `VISUALIZATION_FAILED` | 200 | Data found but plot generation failed |

## Fallback Behavior

- **Query Agent Fails**: Basic keyword search
- **Data Retrieval Fails**: "No data found" response  
- **Visualization Fails**: Return data without plots
- **Response Agent Fails**: Template response
- **Session Issues**: Continue without context

---

# 🧪 Testing Examples

## Basic Temperature Query
```bash
curl -X POST "https://floatchat-agents.vercel.app/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Show me temperature profiles in Arabian Sea"
  }'
```

## Geographic Bounds Query
```bash
curl -X POST "https://floatchat-agents.vercel.app/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Analyze ocean data in this region",
    "geographic_bounds": {
      "lat_min": 10.0,
      "lat_max": 25.0, 
      "lon_min": 50.0,
      "lon_max": 80.0
    }
  }'
```

## Session-Based Follow-up
```bash
# First query
curl -X POST "https://floatchat-agents.vercel.app/new_session"

# Follow-up query
curl -X POST "https://floatchat-agents.vercel.app/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What about salinity for the same area?",
    "sessionId": "session_uuid_from_above"
  }'
```

---

# 📚 Integration Examples

## JavaScript/React Integration

```javascript
// Create session
const createSession = async () => {
  const response = await fetch('/new_session', { method: 'POST' });
  const { sessionId } = await response.json();
  return sessionId;
};

// Query with map bounds
const queryWithMapBounds = async (question, bounds, sessionId) => {
  const response = await fetch('/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      sessionId,
      geographic_bounds: bounds,
      options: { max_results: 20 }
    })
  });
  
  const result = await response.json();
  return result;
};

// Handle visualization rendering
const renderPlots = (visualization) => {
  if (visualization?.plots) {
    visualization.plots.forEach(plot => {
      Plotly.newPlot(`plot-${plot.type}`, plot.data.data, plot.data.layout);
    });
  }
};
```

## Python Integration

```python
import requests
import json

class FloatChatClient:
    def __init__(self, base_url="https://floatchat-agents.vercel.app"):
        self.base_url = base_url
        self.session_id = None
    
    def create_session(self):
        response = requests.post(f"{self.base_url}/new_session")
        self.session_id = response.json()["sessionId"]
        return self.session_id
    
    def query(self, question, geographic_bounds=None, max_results=20):
        payload = {
            "question": question,
            "sessionId": self.session_id,
            "options": {"max_results": max_results}
        }
        
        if geographic_bounds:
            payload["geographic_bounds"] = geographic_bounds
            
        response = requests.post(f"{self.base_url}/query", json=payload)
        return response.json()

# Usage
client = FloatChatClient()
client.create_session()

# Geographic query
bounds = {
    "lat_min": -45.0, "lat_max": -40.0,
    "lon_min": 30.0, "lon_max": 40.0
}
result = client.query("Analyze temperature data", geographic_bounds=bounds)
print(f"Found {result['metadata']['total_profiles']} profiles")
```

---

This API documentation provides comprehensive coverage of all available endpoints and integration patterns for the FloatChat oceanographic data discovery system. 🌊🤖
