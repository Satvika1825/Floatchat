// Base Agent - Common functionality for all agents (simplified)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../env.js';

// Initialize Gemini AI
const genai = new GoogleGenerativeAI(config.GEMINI_API_KEY);
export const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
export const embedModel = genai.getGenerativeModel({ model: 'embedding-001' });

// Common utility functions
export function logAgentStart(agentName, operation) {
    console.log(`🤖 ${agentName} Agent processing: ${operation}`);
}

export function logAgentEnd(agentName, processingTime) {
    console.log(`✅ ${agentName} Agent completed in ${processingTime}ms`);
}

export function logAgentError(agentName, error) {
    console.error(`❌ ${agentName} Agent error:`, error.message);
}

export function createSuccessResponse(data, metadata = {}, processingTime = 0) {
    return {
        success: true,
        data,
        metadata: {
            ...metadata,
            processingTime
        }
    };
}

export function createErrorResponse(error, data = null, metadata = {}, processingTime = 0) {
    return {
        success: false,
        data,
        metadata: {
            ...metadata,
            processingTime,
            error: error.message
        }
    };
}

// Enhanced Chat History Management
export function buildChatContext(chatHistory, maxMessages = 3) {
    if (!chatHistory || chatHistory.length === 0) return '';
    
    const recentMessages = chatHistory.slice(-maxMessages);
    return '\nConversation Context:\n' + 
        recentMessages.map(msg => `User: ${msg.user_question}\nAI: ${msg.ai_response}`).join('\n') + '\n';
}

export function buildPreviousContext(chatHistory, maxMessages = 2) {
    if (!chatHistory || chatHistory.length === 0) return '';
    
    return '\nPrevious conversation context:\n' + 
        chatHistory.slice(-maxMessages).map(msg => 
            `Previous: ${msg.user_question} → ${msg.ai_response.substring(0, 150)}...`
        ).join('\n') + '\n';
}

export function extractRelevantHistory(chatHistory, currentQuery) {
    if (!chatHistory || chatHistory.length === 0) return [];
    
    const keywords = currentQuery.toLowerCase().split(' ');
    const scoredHistory = chatHistory.map(msg => {
        const content = (msg.user_question + ' ' + msg.ai_response).toLowerCase();
        const score = keywords.reduce((acc, keyword) => {
            return acc + (content.includes(keyword) ? 1 : 0);
        }, 0);
        return { ...msg, relevanceScore: score };
    });
    
    return scoredHistory
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3);
}

// Enhanced conversation tracking
export function trackConversationTopics(chatHistory) {
    if (!chatHistory || chatHistory.length === 0) return [];
    
    const topicKeywords = {
        'temperature': ['temperature', 'temp', 'thermal', 'warm', 'cold'],
        'salinity': ['salinity', 'salt', 'saline'],
        'location': ['location', 'region', 'area', 'ocean', 'latitude', 'longitude'],
        'time': ['date', 'time', 'year', 'month', 'season', 'recent'],
        'analysis': ['analyze', 'compare', 'trend', 'pattern'],
        'visualization': ['plot', 'graph', 'chart', 'show', 'display']
    };
    
    const topicCounts = {};
    chatHistory.forEach(msg => {
        const content = (msg.user_question + ' ' + msg.ai_response).toLowerCase();
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            const count = keywords.reduce((acc, keyword) => {
                return acc + (content.split(keyword).length - 1);
            }, 0);
            topicCounts[topic] = (topicCounts[topic] || 0) + count;
        });
    });
    
    return Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([topic, count]) => ({ topic, count }));
}

export function detectConversationPatterns(chatHistory) {
    if (!chatHistory || chatHistory.length < 2) return [];
    
    const patterns = [];
    
    // Sequential questions about same topic
    const recentQuestions = chatHistory.slice(-3).map(msg => msg.user_question.toLowerCase());
    
    if (recentQuestions.every(q => q.includes('temperature'))) {
        patterns.push('temperature-focused-sequence');
    }
    
    if (recentQuestions.every(q => q.includes('plot') || q.includes('show'))) {
        patterns.push('visualization-focused-sequence');
    }
    
    // Follow-up pattern detection
    const lastQuestion = chatHistory[chatHistory.length - 1]?.user_question.toLowerCase() || '';
    if (lastQuestion.includes('also') || lastQuestion.includes('additionally') || lastQuestion.includes('now')) {
        patterns.push('follow-up-question');
    }
    
    // Comparison pattern
    if (lastQuestion.includes('compare') || lastQuestion.includes('vs') || lastQuestion.includes('versus')) {
        patterns.push('comparison-request');
    }
    
    return patterns;
}

export function buildConversationSummary(chatHistory) {
    if (!chatHistory || chatHistory.length === 0) return null;
    
    const topics = trackConversationTopics(chatHistory);
    const patterns = detectConversationPatterns(chatHistory);
    const totalInteractions = chatHistory.length;
    
    return {
        totalInteractions,
        mainTopics: topics.slice(0, 3),
        patterns,
        lastInteraction: chatHistory[chatHistory.length - 1]
    };
}