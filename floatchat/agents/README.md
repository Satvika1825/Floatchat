# FloatChat Agent System

Multi-agent Express backend for AI-powered ARGO ocean data exploration with conversation memory and intelligent caching.

## Features

🤖 **Multi-Agent Architecture**
- **Query Agent**: Natural language understanding with conversation context
- **Data Retrieval Agent**: Vector and structured search capabilities  
- **Visualization Agent**: Automatic plot generation
- **Response Agent**: Context-aware response generation

🔥 **Firebase Integration**
- Conversation memory (last 10 messages per session)
- Query result caching (1-hour TTL)
- Session management (24-hour auto-cleanup)
- Conversation export (JSON, CSV, ASCII)

⚡ **Smart Features**
- Context-aware follow-up queries ("same area", "those floats")
- Intelligent caching for fast responses
- Multi-format conversation export
- Automatic session cleanup

## Quick Start

### 1. Install Dependencies
```bash
cd agents
npm install
```

### 2. Environment Setup
The system uses `env.js` for configuration. Key settings:
- FastAPI backend URL (default: http://localhost:3000)
- Gemini API key for AI processing
- Firebase project configuration
- Caching and session TTL settings

### 3. Start the Server
```bash
npm start
# or for development
npm run dev
```

Server runs on port 5000 by default.

## API Endpoints

### Core Conversation API

#### Process Query with Agents
```bash
POST /query
{
  "question": "Show me temperature profiles in the Indian Ocean",
  "sessionId": "session_uuid_123",  // optional
  "options": { 
    "max_results": 10, 
    "useCache": true 
  }
}
```

Response includes:
- Natural language response
- ARGO profile data
- Visualizations (when applicable)
- Processing metadata
- Session information

#### Create New Session
```bash
POST /new_session
```
Returns: `{ "sessionId": "uuid", "created_at": "timestamp" }`

#### Get Chat History
```bash
GET /chat_history/:sessionId?limit=10
```

### Conversation Management

#### Export Conversation
```bash
GET /export_conversation/:sessionId?format=json|csv|ascii
```
Downloads conversation in requested format.

#### Conversation Summary
```bash
GET /conversation_summary/:sessionId
```
Returns topics, regions, and statistics discussed.

### Data Access

#### Statistics Proxy
```bash
GET /statistics
```
Proxies FastAPI statistics endpoint.

#### Profile Details
```bash
GET /profiles/:profileId/details
```

#### Health Check
```bash
GET /health
```

## Usage Examples

### 1. Initial Query
```javascript
const response = await fetch('/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: "Find temperature profiles in the Arabian Sea from 2023",
    options: { max_results: 15 }
  })
});

const result = await response.json();
// result.sessionId for follow-up queries
```

### 2. Context-Aware Follow-up
```javascript
// Uses conversation context from sessionId
const followUp = await fetch('/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: "What about salinity for the same region?", // Contextual!
    sessionId: result.sessionId, // Provides context
    options: { max_results: 15 }
  })
});
// AI understands "same region" from previous conversation
```

### 3. Export Research
```javascript
// Download conversation as CSV
window.location = `/export_conversation/${sessionId}?format=csv`;
```

## Architecture

### Agent Workflow
```
User Query → Query Agent → Data Retrieval Agent → Visualization Agent → Response Agent → User
     ↓              ↓              ↓                    ↓              ↓
Conversation   Parameter    Vector/Structured    Plot Generation   Context-Aware
Context        Extraction      Search              (if needed)      Response
```

### Firebase Collections

#### Conversations
```javascript
{
  sessionId: "session_uuid",
  messages: [{
    id: "msg_id",
    user_question: "Show me temperature data",
    ai_response: "I found 15 temperature profiles...",
    timestamp: Date,
    metadata: {
      profiles_found: 15,
      visualization_type: "temperature",
      processing_time: 1250
    }
  }],
  created_at: Date,
  last_activity: Date
}
```

#### Query Results Cache
```javascript
{
  query_key: "query_hash",
  profiles: [...],
  visualization: {...},
  response: "text",
  created_at: Date,
  expires_at: Date // 1-hour TTL
}
```

## Agent Capabilities

### Query Agent
- Natural language understanding
- Parameter extraction (location, time, variables)
- Intent classification (search, plot, compare, analyze)
- Context resolution from chat history
- Confidence scoring

### Data Retrieval Agent
- Vector similarity search (semantic)
- Structured parameter search
- Hybrid search strategies
- Result caching and validation

### Visualization Agent
- Automatic plot type selection
- Multi-profile comparisons
- Interactive Plotly visualizations
- Format selection (JSON, HTML)

### Response Agent
- Context-aware response generation
- Scientific explanation and insights
- Conversation continuity
- Follow-up suggestions

## Configuration

### Environment Variables
```bash
PORT=5000
FASTAPI_URL=http://localhost:3000
GEMINI_API_KEY=your_key_here
```

### Firebase Setup
- Uses `floatchat_service.json` for authentication
- Auto-creates required Firestore collections
- Handles connection failures gracefully

### Caching Configuration
- Query results: 1-hour TTL
- Sessions: 24-hour auto-cleanup
- Chat history: Last 10 messages per session

## Error Handling

The system includes comprehensive error handling:
- Graceful degradation when Firebase is unavailable
- Fallback responses when AI services fail
- Retry logic for network operations
- Detailed error logging and user feedback

## Development

### Project Structure
```
agents/
├── server.js          # Express server and API endpoints
├── coordinator.js     # Agent coordination logic
├── agents.js          # Individual agent implementations
├── firebase.js        # Firebase integration
├── env.js            # Environment configuration
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

### Key Dependencies
- `express` - Web framework
- `@google/generative-ai` - Gemini AI integration
- `firebase-admin` - Firebase/Firestore client
- `axios` - HTTP client for FastAPI communication
- `uuid` - Session ID generation
- `cors` - Cross-origin support

### Development Commands
```bash
npm run dev    # Start with nodemon for development
npm start      # Start production server
```

## Integration

This agent system is designed to work with:
- **FastAPI Backend** (port 3000) - Data processing and storage
- **Frontend Applications** - React, Vue, or any web interface
- **Firebase** - Conversation persistence and caching

The system provides a complete conversational interface layer over the ARGO oceanographic data, enabling natural language exploration with memory and context awareness.