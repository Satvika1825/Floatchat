// Firebase integration for conversation memory and caching
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { config } from './env.js';

// Initialize Firebase Admin
let firebaseApp;
try {
    const serviceAccount = JSON.parse(readFileSync(config.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
    
    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.FIREBASE_PROJECT_ID
    });
    
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error.message);
}

const db = admin.firestore();

// Chat memory functions
export async function saveMessage(sessionId, userQuestion, aiResponse, metadata = {}) {
    try {
        const messageId = Date.now().toString();
        const messageData = {
            id: messageId,
            user_question: userQuestion,
            ai_response: aiResponse,
            timestamp: new Date(),
            metadata: {
                profiles_found: metadata.profiles_found || 0,
                visualization_type: metadata.visualization_type || null,
                processing_time: metadata.processing_time || 0,
                ...metadata
            }
        };

        // Add message to conversation
        const conversationRef = db.collection('conversations').doc(sessionId);
        await conversationRef.set({
            sessionId: sessionId,
            last_activity: new Date(),
            created_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Add message to messages subcollection
        await conversationRef.collection('messages').doc(messageId).set(messageData);
        
        console.log(`💬 Message saved to session ${sessionId}`);
        return messageId;
    } catch (error) {
        console.error('Save message error:', error.message);
        return null;
    }
}

export async function getChatHistory(sessionId, limit = config.MAX_CHAT_HISTORY) {
    try {
        const messagesRef = db.collection('conversations').doc(sessionId).collection('messages');
        const snapshot = await messagesRef.orderBy('timestamp', 'desc').limit(limit).get();
        
        const messages = [];
        snapshot.forEach(doc => {
            messages.push(doc.data());
        });
        
        // Return in chronological order (oldest first)
        return messages.reverse();
    } catch (error) {
        console.error('Get chat history error:', error.message);
        return [];
    }
}

export async function createNewSession() {
    try {
        // Generate simple session ID
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.collection('conversations').doc(sessionId).set({
            sessionId: sessionId,
            created_at: new Date(),
            last_activity: new Date()
        });
        
        console.log(`🆕 New session created: ${sessionId}`);
        return sessionId;
    } catch (error) {
        console.error('Create session error:', error.message);
        return `fallback_${Date.now()}`;
    }
}

// Query result caching functions
export async function cacheQueryResult(queryKey, result) {
    try {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + config.CACHE_TTL_HOURS);
        
        await db.collection('query_results').doc(queryKey).set({
            query_key: queryKey,
            profiles: result.profiles || [],
            visualization: result.visualization || null,
            response: result.response || '',
            created_at: new Date(),
            expires_at: expiresAt
        });
        
        console.log(`💾 Query result cached: ${queryKey}`);
    } catch (error) {
        console.error('Cache query error:', error.message);
    }
}

export async function getCachedResult(queryKey) {
    try {
        const doc = await db.collection('query_results').doc(queryKey).get();
        
        if (!doc.exists) {
            return null;
        }
        
        const data = doc.data();
        const now = new Date();
        
        // Check if cache is expired
        if (data.expires_at.toDate() < now) {
            // Delete expired cache
            await doc.ref.delete();
            console.log(`🗑️ Expired cache deleted: ${queryKey}`);
            return null;
        }
        
        console.log(`⚡ Cache hit: ${queryKey}`);
        return {
            profiles: data.profiles,
            visualization: data.visualization,
            response: data.response,
            cached: true
        };
    } catch (error) {
        console.error('Get cached result error:', error.message);
        return null;
    }
}

// Utility function to generate cache key from query
export function generateCacheKey(question, options = {}) {
    const normalized = question.toLowerCase().trim() + JSON.stringify(options);
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        const char = normalized.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `query_${Math.abs(hash)}`;
}

// Cleanup old sessions (utility function)
export async function cleanupOldSessions() {
    try {
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - config.SESSION_TTL_HOURS);
        
        const oldSessions = await db.collection('conversations')
            .where('last_activity', '<', cutoffTime)
            .get();
        
        const deletePromises = [];
        oldSessions.forEach(doc => {
            deletePromises.push(doc.ref.delete());
        });
        
        await Promise.all(deletePromises);
        console.log(`🧹 Cleaned up ${oldSessions.size} old sessions`);
    } catch (error) {
        console.error('Cleanup sessions error:', error.message);
    }
}