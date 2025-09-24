/**
 * CORS Configuration
 * This file contains all CORS-related configuration for the application
 */

// Default allowed origins for development
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

// If you need to add additional production origins, read them from environment
// variable but do not use wildcards
if (process.env.FRONTEND_ORIGINS) {
    const envOrigins = process.env.FRONTEND_ORIGINS.split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
    allowedOrigins.push(...envOrigins);
}

// CORS configuration options
const corsOptions = {
    origin: function(origin, callback) {
        // For non-browser requests (like Postman during development)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

export { allowedOrigins, corsOptions };