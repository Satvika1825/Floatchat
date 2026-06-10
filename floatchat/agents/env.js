// Environment configuration for FloatChat agents
export const config = {
    // Server configuration
    PORT: process.env.PORT || 5000,
    
    // FastAPI backend URL - Direct to actual backend (dynamic)
    FASTAPI_URL: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://floatchat-aitu.onrender.com',
    
    // Gemini AI API key
    GEMINI_API_KEY: 'AIzaSyDPQHjMcGS0BKyGOogt15-tmhaM5QN1ZqA',
    
    // Firebase configuration
    FIREBASE_PROJECT_ID: 'floatchat-471810',
    FIREBASE_SERVICE_ACCOUNT_PATH: './floatchat_service.json',
    
    // Cache configuration
    CACHE_TTL_HOURS: 1,
    SESSION_TTL_HOURS: 24,
    MAX_CHAT_HISTORY: 10
};