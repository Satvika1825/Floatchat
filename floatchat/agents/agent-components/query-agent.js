// Query Agent - Interprets user queries and extracts parameters (simplified)
import { 
    model, 
    logAgentStart, 
    logAgentEnd, 
    logAgentError, 
    createSuccessResponse, 
    createErrorResponse,
    buildChatContext,
    extractRelevantHistory,
    detectConversationPatterns
} from './base-agent.js';

export async function queryAgent(userQuestion, chatHistory = [], geographicBounds = null) {
    const startTime = Date.now();
    
    logAgentStart('Query', userQuestion);
    
    if (geographicBounds) {
        console.log('🗺️ Geographic bounds provided:', geographicBounds);
    }
    
    try {
        // Build enhanced context from chat history
        const contextInfo = buildChatContext(chatHistory);
        const relevantHistory = extractRelevantHistory(chatHistory, userQuestion);
        const conversationPatterns = detectConversationPatterns(chatHistory);
        
        // Build conversation threads
        let conversationThreads = '';
        if (relevantHistory.length > 0) {
            conversationThreads = '\nRelevant previous discussions:\n' + 
                relevantHistory.map((msg, idx) => 
                    `Thread ${idx + 1}: ${msg.user_question} → ${msg.ai_response.substring(0, 100)}...`
                ).join('\n') + '\n';
        }

        // Add conversation patterns
        let patternInfo = '';
        if (conversationPatterns.length > 0) {
            patternInfo = `\nConversation patterns detected: ${conversationPatterns.join(', ')}\n`;
        }

        // Build geographic context if bounds provided
        let geographicContext = '';
        if (geographicBounds) {
            geographicContext = buildGeographicContext(geographicBounds);
        }

        const systemPrompt = buildSystemPrompt(userQuestion, contextInfo, conversationThreads, patternInfo, geographicContext);
        
        const result = await model.generateContent(systemPrompt);
        const rawResponse = result.response.text();
        
        console.log('🔍 Raw AI Response:', rawResponse);
        
        const interpretation = parseResponse(rawResponse);
        
        const processingTime = Date.now() - startTime;
        logAgentEnd('Query', processingTime);
        
        return createSuccessResponse(interpretation, {
            confidence: interpretation.confidence,
            suggestions: interpretation.suggestions || [],
            conversationPatterns
        }, processingTime);
    } catch (error) {
        logAgentError('Query', error);
        return createErrorResponse(error, getFallbackInterpretation(userQuestion), {
            confidence: 0.3
        }, Date.now() - startTime);
    }
}

function buildSystemPrompt(userQuestion, contextInfo, conversationThreads, patternInfo, geographicContext) {
    return `You are an expert oceanographer assistant analyzing ARGO float data queries. 
${contextInfo}
${conversationThreads}
${patternInfo}
${geographicContext}

Current user query: "${userQuestion}"

Analyze this query and return a JSON response with:
{
  "intent": "search|plot|compare|analyze",
  "parameters": {
    "location": {"lat_min": null, "lat_max": null, "lon_min": null, "lon_max": null},
    "temporal": {"date_start": null, "date_end": null},
    "variables": ["temperature", "salinity", "oxygen"],
    "ocean_region": null,
    "platform_numbers": [],
    "analysis_type": null
  },
  "search_terms": "terms for semantic search",
  "plot_type": "temperature|salinity|ts_diagram|depth_profile",
  "confidence": 0.8,
  "context_references": ["what previous context this query references"],
  "suggestions": ["follow-up question suggestions"],
  "conversation_continuity": "how this relates to previous discussions"
}

CRITICAL GUIDELINES:
**Location Parsing:**
- PRIORITY: If map-based coordinates are provided in geographic context, use them EXACTLY as specified
- For single coordinates (e.g., "latitude -43, longitude 35"), create reasonable search areas: ±1-2 degrees for better data coverage  
- For plotting requests near coordinates, be generous with bounds to ensure data is found
- Example: lat -43, lon 35 → lat_min: -45, lat_max: -41, lon_min: 33, lon_max: 37
- Map selections override text-based coordinate parsing

**Temporal Filtering:**
- ONLY add date filters if user explicitly mentions dates/years/seasons
- Do NOT add default date ranges like "2020-2025" unless specifically requested
- Leave date_start and date_end as null for open temporal searches

**Intent Classification:**
- "plot", "graph", "chart", "visualize" → intent: "plot"
- "temperature profile", "depth profile" → intent: "plot", plot_type: "depth_profile"
- "compare", "vs", "versus" → intent: "compare"
- General data requests → intent: "search"

**Ocean Regions:**
- Be specific: "Southern Ocean", "Indian Ocean", "Arabian Sea", "Equatorial Pacific"
- Use null if region cannot be determined from coordinates

**Conversation Continuity:**
- Reference previous discussions when relevant: "Continuing from temperature analysis..."
- Build on previous parameters when appropriate
- Suggest related analyses based on conversation history
- Use context_references to link to specific previous topics

**Enhanced Context Awareness:**
- If follow-up question detected, inherit relevant parameters from previous query
- If comparison requested, suggest comparing with previous data
- If visualization sequence detected, optimize plot type for sequence

Focus on making search parameters inclusive enough to find available data while being scientifically meaningful.`;
}

function parseResponse(rawResponse) {
    try {
        // Clean the response of any markdown formatting
        const cleanResponse = rawResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        console.log('🧹 Cleaned Response:', cleanResponse);
        
        return JSON.parse(cleanResponse);
    } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        console.error('📄 Failed to parse response:', rawResponse);
        throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
    }
}

function getFallbackInterpretation(userQuestion) {
    return {
        intent: 'search',
        parameters: {},
        search_terms: userQuestion,
        plot_type: 'temperature',
        confidence: 0.3,
        context_references: [],
        suggestions: ['Try being more specific about location or time period'],
        conversation_continuity: null
    };
}

function buildGeographicContext(geographicBounds) {
    if (!geographicBounds) return '';
    
    const { lat_min, lat_max, lon_min, lon_max } = geographicBounds;
    let contextParts = [];
    
    // Build readable coordinate description
    if (lat_min !== null && lat_max !== null && lon_min !== null && lon_max !== null) {
        contextParts.push(`Map selection: ${lat_min}°N to ${lat_max}°N, ${lon_min}°E to ${lon_max}°E`);
        
        // Calculate area and center
        const centerLat = (lat_min + lat_max) / 2;
        const centerLon = (lon_min + lon_max) / 2;
        const latRange = Math.abs(lat_max - lat_min);
        const lonRange = Math.abs(lon_max - lon_min);
        
        contextParts.push(`Center point: ${centerLat.toFixed(2)}°N, ${centerLon.toFixed(2)}°E`);
        contextParts.push(`Area coverage: ${latRange.toFixed(2)}° latitude × ${lonRange.toFixed(2)}° longitude`);
        
        // Determine ocean region based on coordinates
        const oceanRegion = determineOceanRegion(centerLat, centerLon);
        if (oceanRegion) {
            contextParts.push(`Likely region: ${oceanRegion}`);
        }
    } else {
        // Handle partial bounds
        if (lat_min !== null || lat_max !== null) {
            const latBounds = [];
            if (lat_min !== null) latBounds.push(`≥${lat_min}°N`);
            if (lat_max !== null) latBounds.push(`≤${lat_max}°N`);
            contextParts.push(`Latitude bounds: ${latBounds.join(', ')}`);
        }
        
        if (lon_min !== null || lon_max !== null) {
            const lonBounds = [];
            if (lon_min !== null) lonBounds.push(`≥${lon_min}°E`);
            if (lon_max !== null) lonBounds.push(`≤${lon_max}°E`);
            contextParts.push(`Longitude bounds: ${lonBounds.join(', ')}`);
        }
    }
    
    return `\nGeographic Context (Map Selection):\n${contextParts.join('\n')}\n`;
}

function determineOceanRegion(lat, lon) {
    // Simple ocean region determination based on coordinates
    // This is a simplified version - could be enhanced with more precise boundaries
    
    if (lat < -40) {
        return 'Southern Ocean';
    }
    
    if (lon >= 20 && lon <= 147) {
        if (lat >= -40 && lat <= 30) {
            if (lon >= 20 && lon <= 100) {
                return 'Indian Ocean';
            } else {
                return 'Western Pacific';
            }
        }
    }
    
    if (lon >= -80 && lon <= 20) {
        if (lat >= -40 && lat <= 30) {
            return 'Atlantic Ocean';
        }
    }
    
    if (lon >= 147 || lon <= -80) {
        if (lat >= -40 && lat <= 60) {
            return 'Pacific Ocean';
        }
    }
    
    // Arabian Sea specific region
    if (lat >= 10 && lat <= 25 && lon >= 50 && lon <= 80) {
        return 'Arabian Sea';
    }
    
    return 'Global Ocean';
}