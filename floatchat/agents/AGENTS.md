# FloatChat Agent System Flow

Complete guide to understanding the modular multi-agent system with enhanced conversation tracking and improved chat history management.

## 🏗️ System Architecture Overview

```
Frontend Request → Express Server → Agent Coordinator → Modular Agents → Response
                      ↓                    ↓                    ↓
                 Session Mgmt         Agent Pipeline       Firebase Storage
                 Rate Limiting        Error Handling       Enhanced Memory
                 Input Validation     Result Aggregation   Conversation Context
```

## 📁 New Modular Structure

The agent system has been separated into individual files in the `agent-components` folder for better organization:

```
agents/
├── agent-components/
│   ├── base-agent.js           # Common utilities & chat history management
│   ├── query-agent.js         # Enhanced query interpretation + map support
│   ├── data-retrieval-agent.js # Multi-strategy data retrieval
│   ├── visualization-agent.js  # Smart visualization selection
│   └── response-agent.js      # Context-aware response + geographic analysis
├── index.js              # Main exports
├── agents.js             # Legacy compatibility layer
└── AGENTS.md            # This documentation
```

## 🗺️ NEW: Map-Based Geographic Queries

### Interactive Map Integration Support

The system now fully supports map-based queries where users can select geographic bounds on an interactive map. This provides precise spatial targeting for oceanographic analysis.

#### 🔍 Query Endpoint Enhancement
```javascript
POST /query
{
  "question": "Show me temperature data in this region",
  "sessionId": "session_123",
  "options": { "max_results": 10 },
  "geographic_bounds": {
    "lat_min": -45.0,
    "lat_max": -40.0, 
    "lon_min": 30.0,
    "lon_max": 40.0
  }
}
```

#### ⚡ Processing Flow
1. **Input Validation:** Comprehensive lat/long range validation (-90 to 90, -180 to 180)
2. **Query Agent Enhancement:** Geographic bounds override text-based coordinate parsing
3. **Context Building:** Rich geographic analysis with ocean regions and characteristics  
4. **Response Integration:** Oceanographic context based on selected area

#### 🌊 Geographic Context Features
- **Ocean Region Detection:** Automatically identifies Southern Ocean, Arabian Sea, etc.
- **Oceanographic Context:** Provides region-specific insights (currents, water masses)  
- **Profile Distribution Analysis:** Analyzes temporal and spatial coverage within bounds
- **Area Calculations:** Computes center point, coverage area, and search radius

#### 🎯 Example Usage with Map Selection

**Scenario:** User selects Southern Indian Ocean region on map
```javascript
// Frontend sends selected bounds
{
  "question": "What's the temperature like in this area?",
  "geographic_bounds": {
    "lat_min": -45.0, "lat_max": -40.0,
    "lon_min": 30.0, "lon_max": 40.0  
  }
}

// System Response Includes:
"Map-Selected Area: -45.0°N to -40.0°N, 30.0°E to 40.0°E
Ocean region: Southern Ocean (Indian sector)
Oceanographic context: Subantarctic waters with strong westerly currents and upwelling
Profile temporal spread: 15 days across 8 profiles

The temperature data shows typical Southern Ocean characteristics with surface temperatures around 8-12°C decreasing to 2-4°C at depth..."
```

## 🆕 Enhanced Multiple Plot Architecture

### Complete System Support for Multiple Visualizations

The system now fully supports multiple plot generation at all levels:

#### 🔄 Agent Coordinator Updates
```javascript
// Enhanced visualization step in coordinator.js
const vizResult = await visualizationAgent(profiles, interpretation, chatHistory);

// Smart logging for multiple plots
if (visualization.plots && visualization.plots.length > 0) {
    const plotTypes = visualization.plots.map(p => p.type).join(', ');
    console.log(`📈 Generated ${visualization.plots.length} visualizations (${plotTypes})`);
}

// Enhanced metadata tracking
metadata: {
    visualization_info: {
        plot_count: visualization?.plots?.length || 0,
        plot_types: visualization?.plots?.map(p => p.type) || [],
        analysis_type: visualization?.metadata?.analysisType || 'single'
    }
}
```

#### ⚡ Performance Optimizations
- **Single Data Fetch:** Database query shared across all plot types
- **Parallel Processing:** Multiple plots generated simultaneously
- **Efficient Fallback:** Individual calls if batch processing fails
- **Smart Caching:** Results cached with multiple plot structure

#### 📊 FastAPI Enhancements
- **New `/plot_profiles_multiple` endpoint** for efficient batch processing
- **Graceful error handling** - partial success supported
- **Optimized data pipeline** - single DataFrame for all plots
- **Backward compatibility** maintained with existing endpoints

## 🤖 Multi-Agent Processing Flow

### 1. Request Entry Point (Express Server)
```javascript
POST /query
{
  "question": "Show me temperature profiles in the Indian Ocean",
  "sessionId": "session_123",  // Optional
  "options": { "max_results": 10 }
}
```

**Express Server Responsibilities:**
- Input validation (question length, session ID format)
- Request size limits (10MB max)
- CORS handling
- Error handling and response formatting
- Session management

### 2. Agent Coordinator Orchestration

The `coordinator.js` manages the entire agent pipeline:

```javascript
async function processQuery(userQuestion, sessionId, options) {
    // Step 1: Get conversation history for context
    const chatHistory = await getChatHistory(sessionId);
    
    // Step 2: Check cache (1-hour TTL)
    const cachedResult = await getCachedResult(cacheKey);
    if (cachedResult) return cachedResult;
    
    // Step 3: Agent Pipeline
    const queryResult = await queryAgent(userQuestion, chatHistory);
    const dataResult = await dataRetrievalAgent(interpretation, options);
    const vizResult = await visualizationAgent(profiles, interpretation);
    const responseResult = await responseAgent(userQuestion, profiles, viz, interpretation, chatHistory);
    
    // Step 4: Cache result and return
    await cacheQueryResult(cacheKey, result);
    return result;
}
```

## 🔄 Individual Agent Flows

### Agent 1: Query Agent (`query-agent.js`)
**Purpose:** Enhanced natural language understanding with map-based geographic support

```javascript
Input: "What about salinity for the same region?"
Context: Enhanced conversation history + pattern detection

Processing:
1. Build enhanced context from chat history (buildChatContext)
2. Extract relevant previous discussions (extractRelevantHistory)
3. Detect conversation patterns (detectConversationPatterns)
4. Generate enriched prompt with conversation threads
5. Send to Gemini Pro for interpretation with context awareness

Output:
{
  "intent": "search",
  "parameters": {
    "location": {"lat_min": 10, "lat_max": 20, ...},
    "variables": ["salinity"],
    "ocean_region": "Indian Ocean"
  },
  "search_terms": "salinity Indian Ocean profiles",
  "confidence": 0.85,
  "context_references": ["same region"],
  "conversation_continuity": "Building on temperature analysis",
  "suggestions": ["Compare with temperature data", "Try depth analysis"]
}
```

**Enhanced Features:**
- ✅ **Smart context resolution** - "same area" → previous coordinates
- ✅ **Map-based geographic bounds** - Direct integration with interactive map selections
- ✅ **Geographic context building** - Ocean region detection and oceanographic insights
- ✅ **Coordinate prioritization** - Map selections override text-based parsing
- ✅ **Conversation pattern detection** - Follow-up questions, comparisons
- ✅ **Relevance-based history** - Weighted by keyword matching
- ✅ **Enhanced prompting** - Context-aware system prompts with geographic analysis

### Agent 2: Data Retrieval Agent (`data-retrieval-agent.js`)
**Purpose:** Enhanced data fetching with multiple search strategies and contextual statistics

```javascript
Input: Interpretation from Query Agent + Options

Decision Logic:
if (confidence < 0.6 || intent === 'search') {
    // Use semantic vector search
    embedding = await generateEmbedding(search_terms);
    profiles = await vectorSearch(embedding);
} else {
    // Use structured parameter search
    profiles = await structuredSearch(parameters);
}

Processing:
1. Generate embeddings for semantic search (if needed)
2. Call FastAPI endpoints (/vector_search or /search_profiles)
3. Validate and filter results
4. Return structured profile data

Output: Array of ARGO profiles with metadata
```

**Search Strategies:**
- 🔍 **Vector Search:** For fuzzy queries ("warm water near Africa")
- 📊 **Structured Search:** For specific parameters (lat/lon ranges, dates)
- ⚡ **Hybrid Approach:** Combines both based on confidence

### Agent 3: Enhanced Visualization Agent (`visualization-agent.js`)
**Purpose:** Advanced multiple plot generation with intelligent FastAPI integration

```javascript
Input: Profiles + Interpretation + Chat History

Enhanced Processing Flow:
1. analyzeVisualizationNeeds() → Comprehensive analysis
   - Check visualization intents and keywords
   - Detect multiple plot requests ("plots", "multiple")
   - Analyze data availability (temperature, salinity, depth, oxygen)
   - Generate reasoning and confidence scores

2. determineRecommendedPlots() → Smart plot selection
   - Priority 1: Explicitly requested plot types
   - Priority 2: Multiple plots for comprehensive analysis
   - Priority 3: Context-based (comparison → T-S diagram)
   - Priority 4: Search term analysis
   - Priority 5: Data-driven defaults

3. generateMultipleVisualizations() → Create all plots
   - Call FastAPI /plot_profiles for each plot type
   - Use JSON format for all visualizations
   - Handle failures gracefully (continue with other plots)
   - Enhanced profile selection with scoring

Output Structure:
{
  plots: [
    {
      type: "temperature",
      data: {...plotly_json...},
      reasoning: "Temperature data available",
      priority: 2,
      title: "Temperature Profiles (3 profiles)"
    },
    {
      type: "salinity", 
      data: {...plotly_json...},
      reasoning: "Salinity analysis requested",
      priority: 2,
      title: "Salinity Profiles (3 profiles)"
    }
  ],
  metadata: {
    totalPlots: 2,
    profileIds: [123, 456, 789],
    analysisType: "multiple"
  }
}
```

**Enhanced Visualization Types:**
- 📈 **Temperature profiles:** Thermal structure analysis
- 🌊 **Salinity profiles:** Water mass identification  
- 📊 **T-S diagrams:** Water mass characteristics
- 🔄 **Multiple plots:** Comprehensive oceanographic analysis
- 🎯 **Smart selection:** Data-driven plot recommendations

### Agent 4: Response Agent (`response-agent.js`)
**Purpose:** Advanced response generation with geographic area analysis and oceanographic context

```javascript
Input: Original question + Profiles + Visualization + Interpretation + Chat history

Processing:
1. Build conversation context from recent messages
2. Summarize profile data (location, dates, parameters)
3. Create comprehensive prompt for Gemini Pro
4. Generate contextually aware response

Context Integration:
- "Building on our earlier analysis..."
- "As we saw in the previous temperature data..."
- "This salinity pattern complements the earlier findings..."

Output: Natural language response with scientific insights
```

**Response Features:**
- 🧠 **Context awareness:** References previous conversation
- 🗺️ **Geographic area analysis:** Detailed regional oceanographic context
- 🌊 **Ocean region identification:** Automatic detection of Southern Ocean, Arabian Sea, etc.
- 📍 **Spatial context:** Area calculations, center points, and coverage analysis
- 🔬 **Scientific explanations:** Region-specific oceanographic insights
- 📊 **Data insights:** Key findings from profiles with geographic context
- 💡 **Follow-up suggestions:** Related analyses
- 📈 **Proper visualization handling:** No disclaimers about "can't attach plots"

## 🧠 Enhanced Chat History Management

### New Conversation Tracking Features (`base-agent.js`)

The system now includes sophisticated conversation analysis utilities:

```javascript
// Smart Context Building
buildChatContext(chatHistory, maxMessages = 3)
→ Builds contextual prompt from recent relevant messages

// Relevance-Based History Extraction  
extractRelevantHistory(chatHistory, currentQuery)
→ Scores and ranks previous messages by keyword relevance
→ Returns top 3 most relevant conversations

// Topic Tracking Across Conversations
trackConversationTopics(chatHistory)
→ Analyzes conversation for recurring themes:
   { topic: 'temperature', count: 5 }
   { topic: 'visualization', count: 3 }

// Conversation Pattern Detection
detectConversationPatterns(chatHistory)
→ Identifies patterns like:
   - 'temperature-focused-sequence'
   - 'visualization-focused-sequence' 
   - 'follow-up-question'
   - 'comparison-request'

// Comprehensive Conversation Summary
buildConversationSummary(chatHistory)
→ Returns: {
    totalInteractions,
    mainTopics: [top 3 topics],
    patterns: [detected patterns],
    lastInteraction
  }
```

### Enhanced Context Resolution Examples

```javascript
// Pattern: Follow-up Question Detection
Previous: "Show me temperature profiles in Arabian Sea"
Current:  "What about salinity data?"
→ Pattern detected: 'follow-up-question'
→ Context inherited: Arabian Sea coordinates + salinity focus

// Pattern: Comparison Request
Previous: "Temperature data near India, 2023"  
Current:  "Compare that with 2022 data"
→ Pattern detected: 'comparison-request'
→ Context: Same location + temporal comparison

// Pattern: Topic Sequence
Msg 1: "Temperature profiles Arabian Sea"
Msg 2: "Show temperature trends over time"
Msg 3: "Plot temperature variations by depth"
→ Pattern: 'temperature-focused-sequence'
→ Optimized: Temperature-specific prompting
```

### User Conversation History Tracking

```javascript
// Enhanced Response Agent now tracks:
extractUserConversationHistory(chatHistory, currentQuery)
→ Analyzes user question patterns:
   - Previous topics discussed
   - Query evolution patterns  
   - User expertise level indicators
   - Preferred visualization types

buildConversationContinuity(chatHistory, currentQuery, interpretation)
→ Links current query to previous discussions:
   - References to earlier results
   - Follow-up pattern detection
   - Comparison requests
   - Context continuity scoring
```

## 💾 Chat Handling & Firebase Integration

### Session Management Flow

```javascript
// 1. Session Creation
POST /new_session
→ Generate UUID session ID
→ Create conversation document in Firebase
→ Return session ID to client

// 2. Query with Session
POST /query { sessionId: "session_123" }
→ Retrieve chat history (last 10 messages)
→ Process query with context
→ Save new message to Firebase
→ Return response with updated context
```

### Firebase Collections Structure

#### Conversations Collection
```javascript
conversations/{sessionId} = {
    sessionId: "session_123",
    created_at: Timestamp,
    last_activity: Timestamp,
    
    // Subcollection: messages
    messages/{messageId} = {
        id: "msg_456",
        user_question: "Show me temperature data",
        ai_response: "I found 15 temperature profiles...",
        timestamp: Timestamp,
        metadata: {
            profiles_found: 15,
            visualization_type: "temperature",
            processing_time: 2340
        }
    }
}
```

#### Query Results Cache
```javascript
query_results/{queryKey} = {
    query_key: "query_hash_789",
    profiles: [...], // Array of profile data
    visualization: {...}, // Plotly chart JSON
    response: "I found relevant profiles...",
    created_at: Timestamp,
    expires_at: Timestamp // 1-hour TTL
}
```

### Conversation Context Resolution

```javascript
// Example: Context-aware query processing
Previous: "Show me temperature profiles in the Arabian Sea"
Current:  "What about salinity for the same region?"

Context Resolution Process:
1. Retrieve last 3 messages from Firebase
2. Extract location context: "Arabian Sea" 
3. Query Agent identifies "same region" → Arabian Sea coordinates
4. Data Retrieval Agent searches Arabian Sea + salinity
5. Response Agent references: "Building on the temperature analysis..."
```

## ⚡ Performance Optimizations

### Caching Strategy
```javascript
Cache Key Generation:
question + options → normalized hash → "query_12345"

Cache Hit:
1. Generate cache key from query
2. Check Firebase query_results collection
3. Validate expiration (1-hour TTL)
4. Return cached result instantly

Cache Miss:
1. Process through full agent pipeline
2. Cache result in Firebase
3. Return fresh result
```

### Agent Response Times
- **Query Agent:** ~500ms (Gemini API call)
- **Data Retrieval:** ~1-2s (FastAPI + database)
- **Visualization:** ~1s (Plotly generation)
- **Response Agent:** ~800ms (Gemini API call)
- **Total:** ~3-5 seconds (well under limits)

## 🔄 Error Handling & Fallbacks

### Agent Error Handling
```javascript
// Each agent returns standardized response
{
    success: boolean,
    data: any,
    metadata: {
        confidence: number,
        processingTime: number,
        error?: string
    }
}

// Coordinator handles failures gracefully
if (!queryResult.success) {
    return fallback_response_with_basic_search();
}
```

### Fallback Strategies
1. **Query Agent Fails:** Use basic keyword search
2. **Data Retrieval Fails:** Return "no data found" message
3. **Visualization Fails:** Return data without plots
4. **Response Agent Fails:** Use template response
5. **Firebase Fails:** Use in-memory session (no persistence)

## 🚀 API Endpoint Integration

### Main Endpoints Flow
```javascript
// Health Check
GET /health
→ Simple status response (no agents involved)

// Session Management
POST /new_session
→ Firebase: Create session document
→ Return: { sessionId, created_at }

// Main Query Processing
POST /query
→ Input validation
→ Agent coordination pipeline
→ Firebase: Save conversation
→ Return: { response, profiles, visualization, metadata }

// Chat History
GET /chat_history/{sessionId}
→ Firebase: Retrieve messages
→ Return: { messages, count, sessionId }

// Conversation Export
GET /export_conversation/{sessionId}?format=csv
→ Firebase: Get full history
→ Format: JSON/CSV/ASCII
→ Return: Download file
```

## 🎯 Usage Examples

### Simple Query Flow
```javascript
1. POST /query { "question": "Find temperature data near India" }
   ↓
2. Query Agent: Extract "temperature", "India" → coordinates
   ↓
3. Data Retrieval: Vector search → 12 profiles found
   ↓
4. Visualization Agent: Generate temperature plot
   ↓
5. Response Agent: "I found 12 temperature profiles..."
   ↓
6. Return: { response, profiles[12], visualization }
```

### Context-Aware Follow-up
```javascript
1. Previous: "temperature profiles Arabian Sea" → sessionId: abc123
   ↓
2. POST /query { 
     "question": "What about salinity?",
     "sessionId": "abc123"
   }
   ↓
3. Firebase: Retrieve chat history
   ↓
4. Query Agent: "salinity" + context → Arabian Sea salinity
   ↓
5. Response Agent: "Building on the temperature analysis..."
```

## 🔧 Configuration & Customization

### Environment Configuration
```javascript
// env.js
export const config = {
    FASTAPI_URL: 'https://floatchat-aitu.onrender.com',
    GEMINI_API_KEY: 'your_key',
    CACHE_TTL_HOURS: 1,
    SESSION_TTL_HOURS: 24,
    MAX_CHAT_HISTORY: 10
};
```

### Agent Customization Points
- **Query Agent (`query-agent.js`):** Enhanced prompts with conversation patterns
- **Data Retrieval (`data-retrieval-agent.js`):** Multi-strategy search with contextual stats
- **Visualization (`visualization-agent.js`):** Smart plot selection based on conversation history
- **Response Agent (`response-agent.js`):** Advanced conversation continuity and user tracking
- **Base Agent (`base-agent.js`):** Conversation analysis and history management utilities

## 📊 Enhanced Visualization Architecture

### Major Improvements to Visualization Agent

The visualization system has been completely redesigned to support multiple plots and intelligent analysis:

#### 🎯 Smart Visualization Analysis
```javascript
// Enhanced analysis pipeline
analyzeVisualizationNeeds(interpretation, profiles, chatHistory)
→ Analyzes visualization requirements with confidence scoring
→ Detects multiple plot requests ("give some plots", "show multiple")
→ Evaluates data availability (temperature: 85%, salinity: 70%, etc.)
→ Provides reasoning for each recommendation

// Example for: "ocean temperature data near latitude -43 longitude 35, give some plots"
{
  shouldVisualize: true,
  confidence: 0.8,
  recommendedPlots: [
    { type: 'temperature', priority: 2, reasoning: 'Temperature analysis requested' },
    { type: 'depth_profile', priority: 4, reasoning: 'Depth profile for comprehensive view' }
  ],
  dataAvailability: { hasTemperature: 0.9, hasSalinity: 0.7, ... }
}
```

#### 🔄 Efficient Multiple Plot Generation
- **Automatic Plot Selection:** Based on data availability and user request
- **Priority-Based Ordering:** Explicit requests → Multiple plots → Context → Search terms → Data-driven
- **Dual Generation Strategy:**
  - **Efficient Mode:** Uses new `/plot_profiles_multiple` endpoint for 2+ plots
  - **Individual Mode:** Falls back to single plot calls if needed
- **Database Optimization:** Single data fetch shared across all plots
- **Graceful Error Handling:** Continue with other plots if one fails
- **Enhanced Profile Selection:** Weighted scoring system (data completeness, recency, quality)

#### 📈 Response Integration
The Response Agent now handles both single and multiple plot structures:

```javascript
// For single plot
"A temperature plot has been generated showing the data patterns"

// For multiple plots  
"3 plots have been generated (temperature, salinity, ts_diagram) providing comprehensive analysis"
```

### FastAPI Integration Details

#### New Multiple Plot Endpoint
```javascript
POST /plot_profiles_multiple
{
  profile_ids: [123, 456, 789],
  plot_types: ["temperature", "salinity", "ts_diagram"],
  format: "json"
}

Response:
{
  plots: [
    { type: "temperature", data: {...}, success: true },
    { type: "salinity", data: {...}, success: true },
    { type: "ts_diagram", data: {...}, success: true }
  ],
  metadata: {
    total_requested: 3,
    successful: 3,
    failed: 0,
    profile_ids: [123, 456, 789],
    format: "json"
  }
}
```

#### Single Plot Format (Legacy Support)
```javascript
POST /plot_profiles
{
  profile_ids: [123, 456, 789],
  plot_type: "temperature", 
  format: "json",
  parameters: {
    title: "Temperature Profiles (3 profiles)",
    show_legend: true,
    interactive: true,
    color_scheme: "viridis"
  }
}
```

#### Enhanced Profile Selection Algorithm
- **Data Completeness (40%):** Temperature + Salinity + Depth + Oxygen coverage
- **Recency (30%):** Preference for data < 5 years old  
- **Quality (20%):** Quality flags (A=20pts, B=10pts)
- **Geographic (10%):** Location data availability

## 🔧 Recent Fix: Visualization Response Issue

### Problem Fixed
The system was generating responses like:
```
"The plot (attached - *Note: I can't actually attach a plot here, but imagine...)"
```

### Solution Implemented
Updated the **Response Agent** system prompt with **CRITICAL VISUALIZATION GUIDELINES**:

```javascript
**CRITICAL VISUALIZATION GUIDELINES:**
- When visualization data is provided, assume the plot is available to the user
- DO NOT mention that you "can't actually attach" plots or similar disclaimers
- DO NOT use phrases like "(attached - Note: I can't actually attach...)" 
- Simply reference the visualization as if it's present: "The plot shows..." or "As seen in the visualization..."
- Focus on analyzing and interpreting the data patterns shown in the plots
```

### Result
Now responses properly reference visualizations:
```
"The plot shows a clear temperature gradient with depth..."
"As seen in the visualization, the temperature decreases from 10.85°C at the surface..."
```

## 🆕 Key Improvements in Modular System

### Enhanced Features
- **🧠 Smart Context Resolution:** Advanced conversation pattern detection
- **📈 Conversation Continuity:** Seamless reference to previous discussions  
- **🔍 Relevance-Based History:** Weighted message importance by keyword matching
- **📊 Topic Tracking:** Long-term conversation theme analysis
- **🔄 Pattern Recognition:** Follow-up questions, comparisons, sequences
- **👤 User Behavior Analysis:** Query patterns and expertise detection
- **🎯 Contextual Prompting:** Enhanced AI prompts with conversation awareness

### Modular Benefits
- **📁 Separation of Concerns:** Each agent has focused responsibility
- **🔧 Easy Maintenance:** Individual files for each agent type
- **🚀 Performance:** Simplified function-based approach (no complex classes)
- **📖 Code Clarity:** Clear imports and focused functionality
- **🔗 Backward Compatibility:** Legacy `agents.js` still works

This enhanced modular multi-agent system provides sophisticated, conversation-aware processing of oceanographic queries with advanced memory management and contextual understanding! 🌊🤖✨