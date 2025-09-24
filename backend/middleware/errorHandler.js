/**
 * Global error handling middleware
 * Ensures no sensitive information is exposed to clients
 */
import secureLogger from '../utils/secureLogger.js';

/**
 * Development error response - includes more details for debugging
 */
const sendErrorDev = (err, res) => {
    const sanitizedError = secureLogger.sanitizeError(err);
    
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: secureLogger.sanitizeString(err.message),
        error: sanitizedError,
        // Include stack trace only in development and sanitized
        stack: sanitizedError.stack
    });
};

/**
 * Production error response - minimal information for security
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted errors: send message to client
    if (err.isOperational || (err.statusCode && err.statusCode < 500)) {
        res.status(err.statusCode || 500).json({
            status: err.status || 'fail',
            message: secureLogger.sanitizeString(err.message)
        });
    } else {
        // Programming or unknown errors: don't leak error details
        secureLogger.error('Unexpected error occurred', err);
        
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

/**
 * Handle specific error types
 */
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return { message, statusCode: 400, status: 'fail', isOperational: true };
};

const handleDuplicateFieldsDB = err => {
    const duplicateField = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${duplicateField}. Please use another value.`;
    return { message, statusCode: 400, status: 'fail', isOperational: true };
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return { message, statusCode: 400, status: 'fail', isOperational: true };
};

const handleJWTError = () => {
    return { 
        message: 'Invalid token. Please log in again!', 
        statusCode: 401, 
        status: 'fail', 
        isOperational: true 
    };
};

const handleJWTExpiredError = () => {
    return { 
        message: 'Your token has expired! Please log in again.', 
        statusCode: 401, 
        status: 'fail', 
        isOperational: true 
    };
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
    // Set default values
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error securely
    if (err.statusCode >= 500) {
        secureLogger.error('Server error occurred', err, {
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
    } else {
        secureLogger.warn('Client error occurred', null, {
            method: req.method,
            url: req.originalUrl,
            statusCode: err.statusCode,
            message: err.message,
            timestamp: new Date().toISOString()
        });
    }

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Handle specific MongoDB errors
        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
        
        // Handle JWT errors
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

/**
 * Middleware to catch async errors and pass them to error handler
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

/**
 * Middleware to handle 404 errors
 */
const handleNotFound = (req, res, next) => {
    secureLogger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
};

/**
 * Security-focused request logger middleware
 */
const requestLogger = (req, res, next) => {
    // Only log in development or for errors
    if (process.env.NODE_ENV === 'development') {
        const startTime = Date.now();
        
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logData = {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            };
            
            if (res.statusCode >= 400) {
                secureLogger.warn('Request completed with error', logData);
            } else {
                secureLogger.debug('Request completed', logData);
            }
        });
    }
    
    next();
};

export { 
    globalErrorHandler, 
    catchAsync, 
    handleNotFound,
    requestLogger
};