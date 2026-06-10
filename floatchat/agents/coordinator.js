// Agent Coordinator - Orchestrates the multi-agent workflow
import { queryAgent, dataRetrievalAgent, visualizationAgent, responseAgent } from './agents.js';
import { 
    getCachedResult, 
    cacheQueryResult, 
    getChatHistory, 
    generateCacheKey 
} from './firebase.js';

// Main agent coordination function
export async function processQuery(userQuestion, sessionId = null, options = {}) {
    const startTime = Date.now();
    const queryId = generateQueryId();
    
    console.log(`🚀 Processing query: "${userQuestion}" (ID: ${queryId})`);
    
    try {
        // Step 1: Get conversation history for context
        const chatHistory = sessionId ? await getChatHistory(sessionId) : [];
        console.log(`📚 Retrieved ${chatHistory.length} messages from chat history`);
        
        // Step 2: Check cache if enabled
        let cachedResult = null;
        if (options.useCache !== false) {
            const cacheKey = generateCacheKey(userQuestion, options);
            cachedResult = await getCachedResult(cacheKey);
            
            if (cachedResult) {
                console.log(`⚡ Cache hit! Returning cached result`);
                return {
                    response: cachedResult.response,
                    profiles: cachedResult.profiles,
                    visualization: cachedResult.visualization,
                    sessionId: sessionId,
                    metadata: {
                        cached: true,
                        total_profiles: cachedResult.profiles.length,
                        timestamp: new Date().toISOString(),
                        processing_time: Date.now() - startTime,
                        query_id: queryId
                    }
                };
            }
        }
        
        // OPTIMIZATION: Run query interpretation first (required for data retrieval)
        const queryResult = await queryAgent(userQuestion, chatHistory, options.geographic_bounds);
        if (!queryResult.success) {
            throw new Error('Failed to interpret query');
        }
        
        const interpretation = queryResult.data;
        console.log(`🎯 Query interpreted as: ${interpretation.intent} (confidence: ${interpretation.confidence})`);
        
        // OPTIMIZATION: Data retrieval runs with internal parallel optimization
        const dataResult = await dataRetrievalAgent(interpretation, options);
        if (!dataResult.success || dataResult.data.length === 0) {
            // Generate enhanced fallback response using contextual stats
            const fallbackResponseResult = await responseAgent(
                userQuestion, 
                [], 
                null, 
                interpretation, 
                dataResult.metadata,  // Pass metadata even for empty results
                chatHistory,
                options.geographic_bounds  // Pass geographic bounds even for fallback
            );
            
            return {
                response: fallbackResponseResult.data,
                profiles: [],
                visualization: null,
                sessionId: sessionId,
                metadata: {
                    query_interpretation: interpretation,
                    error: 'No data found',
                    timestamp: new Date().toISOString(),
                    processing_time: Date.now() - startTime,
                    query_id: queryId,
                    contextualStats: dataResult.metadata?.contextualStats,
                    searchStrategy: dataResult.metadata?.searchStrategy
                }
            };
        }
        
        const profiles = dataResult.data;
        console.log(`📊 Retrieved ${profiles.length} profiles using ${dataResult.metadata.searchMethod} search`);
        
        // OPTIMIZATION: Run visualization and response generation in parallel
        const [vizResult, responseResult] = await Promise.all([
            // Step 5: Enhanced Visualization (multiple plots if needed)
            visualizationAgent(profiles, interpretation, chatHistory),
            // Step 6: Enhanced response generation with retrieval metadata and geographic context
            responseAgent(
                userQuestion, 
                profiles, 
                null, // visualization will be null initially, but response can start processing
                interpretation, 
                dataResult.metadata,  // Pass enhanced metadata
                chatHistory,
                options.geographic_bounds  // Pass geographic bounds for context
            )
        ]);
        
        const visualization = vizResult.data;
        
        if (visualization) {
            if (visualization.plots && visualization.plots.length > 0) {
                const plotTypes = visualization.plots.map(p => p.type).join(', ');
                console.log(`📈 Generated ${visualization.plots.length} visualizations (${plotTypes}) with ${vizResult.metadata.profileCount} profiles`);
            } else if (vizResult.metadata.plotType) {
                // Legacy single plot support
                console.log(`📈 Generated ${vizResult.metadata.plotType} visualization with ${vizResult.metadata.profileCount} profiles`);
            }
        }
        
        const finalResponse = responseResult.data;
        
        // Step 7: Cache the result
        const result = {
            response: finalResponse,
            profiles: profiles,
            visualization: visualization
        };
        
        if (options.useCache !== false) {
            const cacheKey = generateCacheKey(userQuestion, options);
            await cacheQueryResult(cacheKey, result);
        }
        
        const totalProcessingTime = Date.now() - startTime;
        console.log(`✅ Query processed successfully in ${totalProcessingTime}ms`);
        
        return {
            response: finalResponse,
            profiles: profiles,
            visualization: visualization,
            sessionId: sessionId,
            metadata: {
                query_interpretation: interpretation,
                total_profiles: profiles.length,
                search_method: dataResult.metadata.searchMethod,
                timestamp: new Date().toISOString(),
                processing_time: totalProcessingTime,
                query_id: queryId,
                processing_times: {
                    query: queryResult.metadata.processingTime,
                    data: dataResult.metadata.processingTime,
                    visualization: vizResult.metadata.processingTime,
                    response: responseResult.metadata.processingTime
                },
                confidence_scores: {
                    query: queryResult.metadata.confidence,
                    data: dataResult.metadata.confidence,
                    visualization: vizResult.metadata.confidence,
                    response: responseResult.metadata.confidence
                },
                visualization_info: {
                    plot_count: visualization?.plots?.length || (visualization ? 1 : 0),
                    plot_types: visualization?.plots?.map(p => p.type) || (visualization ? [vizResult.metadata.plotType] : []),
                    analysis_type: visualization?.metadata?.analysisType || 'single'
                }
            }
        };
        
    } catch (error) {
        console.error(`❌ Agent coordination error: ${error.message}`);
        const errorTime = Date.now() - startTime;
        
        return {
            response: "I encountered an error while processing your query. Please try again or rephrase your question.",
            profiles: [],
            visualization: null,
            sessionId: sessionId,
            metadata: {
                error: error.message,
                timestamp: new Date().toISOString(),
                processing_time: errorTime,
                query_id: queryId
            }
        };
    }
}

// Enhanced query processing with session management
export async function processQueryWithSession(userQuestion, sessionId = null, options = {}) {
    // Use provided session or create context without session
    const result = await processQuery(userQuestion, sessionId, options);
    
    // Return result (session management happens in the API layer)
    return result;
}

// Utility functions
function generateQueryId() {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get conversation summary (for export/analysis)
export async function getConversationSummary(sessionId) {
    try {
        const chatHistory = await getChatHistory(sessionId, 50); // Get more history for summary
        
        if (chatHistory.length === 0) {
            return {
                sessionId: sessionId,
                totalMessages: 0,
                topics: [],
                regions: [],
                summary: 'No conversation history available'
            };
        }
        
        // Extract topics and regions mentioned
        const topics = new Set();
        const regions = new Set();
        
        chatHistory.forEach(msg => {
            const text = (msg.user_question + ' ' + msg.ai_response).toLowerCase();
            
            // Common oceanographic topics
            if (text.includes('temperature')) topics.add('temperature');
            if (text.includes('salinity')) topics.add('salinity');
            if (text.includes('oxygen') || text.includes('bgc')) topics.add('bgc_parameters');
            if (text.includes('depth') || text.includes('profile')) topics.add('depth_profiles');
            
            // Ocean regions
            if (text.includes('indian ocean')) regions.add('Indian Ocean');
            if (text.includes('arabian sea')) regions.add('Arabian Sea');
            if (text.includes('equator')) regions.add('Equatorial');
            if (text.includes('southern ocean')) regions.add('Southern Ocean');
        });
        
        return {
            sessionId: sessionId,
            totalMessages: chatHistory.length,
            topics: Array.from(topics),
            regions: Array.from(regions),
            firstMessage: chatHistory[0]?.timestamp,
            lastMessage: chatHistory[chatHistory.length - 1]?.timestamp,
            summary: `Conversation covered ${topics.size} topics and ${regions.size} regions across ${chatHistory.length} messages`
        };
        
    } catch (error) {
        console.error('Conversation summary error:', error.message);
        return {
            sessionId: sessionId,
            error: error.message,
            totalMessages: 0,
            topics: [],
            regions: []
        };
    }
}