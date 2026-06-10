// FloatChat Agent-Based Express Server
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { config } from './env.js';
import { processQueryWithSession, getConversationSummary } from './coordinator.js';
import { 
    createNewSession, 
    getChatHistory, 
    saveMessage, 
    cleanupOldSessions 
} from './firebase.js';

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));

// Request size limits and parsing
app.use(express.json({ 
    limit: '10mb',           // Increased for larger requests
    strict: true,
    type: 'application/json'
}));
app.use(express.urlencoded({ 
    limit: '10mb',           // Increased for larger requests
    extended: true,
    parameterLimit: 500      // Increased parameter limit
}));

// Request timeout middleware
app.use((req, res, next) => {
    // Set timeout for all requests - increased to 60s for long-running operations
    req.setTimeout(60000, () => {
        if (!res.headersSent) {
            console.log('⏰ Request timeout after 60s');
            res.status(408).json({
                error: 'Request timeout',
                message: 'Request took too long to process',
                timestamp: new Date().toISOString()
            });
        }
    });
    
    next();
});


// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'FloatChat Agent Coordinator',
    });
});

// Main query processing endpoint with agent coordination
app.post('/query', async (req, res) => {
    try {
        const { question, sessionId, options = {}, geographic_bounds } = req.body;
        
        // Comprehensive input validation
        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid question',
                message: 'Question is required and must be a non-empty string'
            });
        }
        
        if (question.length > 2000) {
            return res.status(400).json({
                error: 'Question too long',
                message: 'Question must be less than 2000 characters'
            });
        }
        
        // Validate sessionId if provided
        if (sessionId && (typeof sessionId !== 'string' || sessionId.length > 100)) {
            return res.status(400).json({
                error: 'Invalid session ID',
                message: 'Session ID must be a string under 100 characters'
            });
        }
        
        // Validate geographic bounds if provided
        let validatedGeographicBounds = null;
        if (geographic_bounds) {
            const { lat_min, lat_max, lon_min, lon_max } = geographic_bounds;
            
            // Validate latitude ranges
            if (lat_min !== undefined && (typeof lat_min !== 'number' || lat_min < -90 || lat_min > 90)) {
                return res.status(400).json({
                    error: 'Invalid lat_min',
                    message: 'lat_min must be a number between -90 and 90'
                });
            }
            
            if (lat_max !== undefined && (typeof lat_max !== 'number' || lat_max < -90 || lat_max > 90)) {
                return res.status(400).json({
                    error: 'Invalid lat_max',
                    message: 'lat_max must be a number between -90 and 90'
                });
            }
            
            // Validate longitude ranges
            if (lon_min !== undefined && (typeof lon_min !== 'number' || lon_min < -180 || lon_min > 180)) {
                return res.status(400).json({
                    error: 'Invalid lon_min',
                    message: 'lon_min must be a number between -180 and 180'
                });
            }
            
            if (lon_max !== undefined && (typeof lon_max !== 'number' || lon_max < -180 || lon_max > 180)) {
                return res.status(400).json({
                    error: 'Invalid lon_max',
                    message: 'lon_max must be a number between -180 and 180'
                });
            }
            
            // Validate ranges make sense
            if (lat_min !== undefined && lat_max !== undefined && lat_min >= lat_max) {
                return res.status(400).json({
                    error: 'Invalid latitude range',
                    message: 'lat_min must be less than lat_max'
                });
            }
            
            if (lon_min !== undefined && lon_max !== undefined && lon_min >= lon_max) {
                return res.status(400).json({
                    error: 'Invalid longitude range', 
                    message: 'lon_min must be less than lon_max'
                });
            }
            
            validatedGeographicBounds = {
                lat_min: lat_min !== undefined ? lat_min : null,
                lat_max: lat_max !== undefined ? lat_max : null,
                lon_min: lon_min !== undefined ? lon_min : null,
                lon_max: lon_max !== undefined ? lon_max : null
            };
            
            console.log(`Geographic bounds provided: ${JSON.stringify(validatedGeographicBounds)}`);
        }

        // Validate and limit options
        const validatedOptions = {
            max_results: Math.min(Math.max(parseInt(options.max_results) || 10, 1), 100),
            useCache: options.useCache !== false,
            timeout: Math.min(parseInt(options.timeout) || 20000, 30000),
            geographic_bounds: validatedGeographicBounds
        };
        
        // Check request size
        const requestSize = JSON.stringify(req.body).length;
        if (requestSize > 50000) { // 50KB limit
            return res.status(413).json({
                error: 'Request too large',
                message: 'Request body must be less than 50KB'
            });
        }
        
        console.log(`Processing query: "${question.substring(0, 100)}..." (Session: ${sessionId || 'new'})`);
        
        // Process query through agent coordination with validated options
        const result = await processQueryWithSession(
            question.trim(),
            sessionId,
            validatedOptions
        );
        
        // Save message to conversation history if we have a session
        if (sessionId) {
            await saveMessage(sessionId, question, result.response, {
                profiles_found: result.profiles.length,
                visualization_type: result.visualization?.plot_type || null,
                processing_time: result.metadata.processing_time
            });
        }
        
        console.log(`✅ Query processed: ${result.profiles.length} profiles, visualization: ${!!result.visualization}`);
        
        res.json(result);
        
    } catch (error) {
        console.error('❌ Query processing error:', error.message);
        
        // Only send error response if headers haven't been sent
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Query processing failed',
                message: 'Failed to process your query. Please try again.',
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('⚠️ Cannot send error response - headers already sent');
        }
    }
});

// Create new chat session
app.post('/new_session', async (req, res) => {
    try {
        const sessionId = await createNewSession();
        console.log(`🆕 New session created: ${sessionId}`);
        
        res.json({
            sessionId: sessionId,
            created_at: new Date().toISOString(),
            message: 'New conversation session created'
        });
        
    } catch (error) {
        console.error('❌ Session creation error:', error.message);
        
        // Fallback session ID
        const fallbackSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        res.json({
            sessionId: fallbackSessionId,
            created_at: new Date().toISOString(),
            message: 'Session created (fallback mode)',
            warning: 'Firebase unavailable - using local session'
        });
    }
});

// Get chat history for a session
app.get('/chat_history/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const limit = parseInt(req.query.limit) || config.MAX_CHAT_HISTORY;
        
        if (!sessionId) {
            return res.status(400).json({
                error: 'Invalid session',
                message: 'Session ID is required'
            });
        }
        
        const messages = await getChatHistory(sessionId, Math.min(limit, 100));
        console.log(`📚 Retrieved ${messages.length} messages for session ${sessionId}`);
        
        res.json({
            sessionId: sessionId,
            messages: messages,
            count: messages.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Chat history error:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve chat history',
            message: 'Could not load conversation history',
            sessionId: req.params.sessionId
        });
    }
});

// Get conversation summary
app.get('/conversation_summary/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({
                error: 'Invalid session',
                message: 'Session ID is required'
            });
        }
        
        const summary = await getConversationSummary(sessionId);
        res.json(summary);
        
    } catch (error) {
        console.error('❌ Conversation summary error:', error.message);
        res.status(500).json({
            error: 'Failed to generate summary',
            message: 'Could not create conversation summary'
        });
    }
});

// Export conversation in multiple formats
app.get('/export_conversation/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const format = req.query.format || 'json';
        
        if (!sessionId) {
            return res.status(400).json({
                error: 'Invalid session',
                message: 'Session ID is required'
            });
        }
        
        const messages = await getChatHistory(sessionId, 1000); // Get full history
        const summary = await getConversationSummary(sessionId);
        
        if (messages.length === 0) {
            return res.status(404).json({
                error: 'No conversation found',
                message: 'No messages found for this session'
            });
        }
        
        const exportData = {
            sessionId: sessionId,
            summary: summary,
            messages: messages,
            exported_at: new Date().toISOString()
        };
        
        if (format === 'csv') {
            // CSV format
            const csvHeader = 'timestamp,user_question,ai_response,profiles_found\\n';
            const csvRows = messages.map(msg => {
                return `"${msg.timestamp}","${msg.user_question.replace(/"/g, '""')}","${msg.ai_response.replace(/"/g, '""')}","${msg.metadata.profiles_found || 0}"`;
            }).join('\\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="floatchat_conversation_${sessionId}.csv"`);
            res.send(csvHeader + csvRows);
            
        } else if (format === 'ascii') {
            // ASCII text format
            let asciiContent = `FloatChat Conversation Export\\n`;
            asciiContent += `Session ID: ${sessionId}\\n`;
            asciiContent += `Exported: ${new Date().toISOString()}\\n`;
            asciiContent += `Total Messages: ${messages.length}\\n`;
            asciiContent += `Topics: ${summary.topics.join(', ')}\\n`;
            asciiContent += `Regions: ${summary.regions.join(', ')}\\n`;
            asciiContent += `\\n${'='.repeat(80)}\\n\\n`;
            
            messages.forEach((msg, index) => {
                asciiContent += `Message ${index + 1} - ${msg.timestamp}\\n`;
                asciiContent += `User: ${msg.user_question}\\n`;
                asciiContent += `AI: ${msg.ai_response}\\n`;
                asciiContent += `Profiles Found: ${msg.metadata.profiles_found || 0}\\n`;
                asciiContent += `\\n${'-'.repeat(40)}\\n\\n`;
            });
            
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="floatchat_conversation_${sessionId}.txt"`);
            res.send(asciiContent);
            
        } else {
            // JSON format (default)
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="floatchat_conversation_${sessionId}.json"`);
            res.json(exportData);
        }
        
        console.log(`📤 Exported conversation ${sessionId} in ${format} format`);
        
    } catch (error) {
        console.error('❌ Conversation export error:', error.message);
        res.status(500).json({
            error: 'Export failed',
            message: 'Could not export conversation'
        });
    }
});

// Proxy endpoint for FastAPI statistics
app.get('/statistics', async (req, res) => {
    try {
        const response = await axios.get(`${config.FASTAPI_URL}/statistics/overview`);
        res.json(response.data);
    } catch (error) {
        console.error('❌ Statistics proxy error:', error.message);
        res.status(500).json({
            error: 'Statistics unavailable',
            message: 'Could not retrieve statistics from data service'
        });
    }
});

// Proxy endpoint for profile details
app.get('/profiles/:profileId/details', async (req, res) => {
    try {
        const { profileId } = req.params;
        const response = await axios.get(`${config.FASTAPI_URL}/measurements/${profileId}`);
        res.json(response.data);
    } catch (error) {
        console.error(`❌ Profile details error for ID ${req.params.profileId}:`, error.message);
        res.status(404).json({
            error: 'Profile not found',
            message: 'Could not retrieve profile details'
        });
    }
});

// Enhanced error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    // Handle different types of errors
    let status = error.status || error.statusCode || 500;
    let message = 'An unexpected error occurred';
    
    if (error.name === 'ValidationError') {
        status = 400;
        message = 'Validation error';
    } else if (error.name === 'PayloadTooLargeError') {
        status = 413;
        message = 'Request payload too large';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        status = 503;
        message = 'External service unavailable';
    } else if (error.message.includes('timeout')) {
        status = 408;
        message = 'Request timeout';
    }
    
    // Don't expose internal error details in production
    const errorResponse = {
        error: error.name || 'Internal server error',
        message: message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { 
            details: error.message,
            stack: error.stack 
        })
    };
    
    res.status(status).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
        available_endpoints: [
            'POST /query',
            'POST /new_session', 
            'GET /chat_history/:sessionId',
            'GET /conversation_summary/:sessionId',
            'GET /export_conversation/:sessionId',
            'GET /statistics',
            'GET /profiles/:profileId/details',
            'GET /health'
        ]
    });
});

// Cleanup old sessions periodically (every hour)
setInterval(async () => {
    try {
        await cleanupOldSessions();
    } catch (error) {
        console.error('❌ Cleanup error:', error.message);
    }
}, 60 * 60 * 1000); // 1 hour

// Start server
const server = app.listen(config.PORT, () => {
    console.log(`FloatChat Agent Coordinator running on port ${config.PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\\nShutting down FloatChat Agent Coordinator...');
    server.close(() => {
        console.log('Server shut down gracefully');
        process.exit(0);
    });
});

export default app;