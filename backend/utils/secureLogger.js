/**
 * Secure logging utility that sanitizes sensitive information
 * before logging or sending to clients
 */

class SecureLogger {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
        
        // Sensitive fields that should be sanitized or removed
        this.sensitiveFields = [
            'password',
            'token', 
            'authorization',
            'cookie',
            'session',
            'secret',
            'key',
            'jwt',
            'auth',
            'credential',
            'api_key',
            'client_secret',
            'private_key',
            'access_token',
            'refresh_token',
            'cvv',
            'cardnumber',
            'card_number',
            'pin',
            'ssn',
            'social_security',
            'bank_account',
            'routing_number'
        ];

        // Patterns for IP addresses, emails, and other PII
        this.sensitivePatterns = [
            /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IP addresses
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses (partial masking)
            /mongodb:\/\/[^\s]+/g, // MongoDB connection strings
            /postgresql:\/\/[^\s]+/g, // PostgreSQL connection strings
            /mysql:\/\/[^\s]+/g, // MySQL connection strings
            /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, // Bearer tokens
        ];
    }

    /**
     * Sanitize an object by removing or masking sensitive fields
     */
    sanitizeObject(obj, depth = 0) {
        if (depth > 10) return '[Max Depth Reached]'; // Prevent deep recursion
        
        if (obj === null || obj === undefined) return obj;
        
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }
        
        if (typeof obj !== 'object') return obj;
        
        if (obj instanceof Error) {
            return this.sanitizeError(obj);
        }
        
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item, depth + 1));
        }
        
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            
            // Check if key contains sensitive information
            if (this.sensitiveFields.some(field => lowerKey.includes(field))) {
                if (typeof value === 'string' && value.length > 0) {
                    sanitized[key] = this.maskSensitiveValue(value);
                } else {
                    sanitized[key] = '[REDACTED]';
                }
            } else {
                sanitized[key] = this.sanitizeObject(value, depth + 1);
            }
        }
        
        return sanitized;
    }

    /**
     * Sanitize string content by masking sensitive patterns
     */
    sanitizeString(str) {
        if (typeof str !== 'string') return str;
        
        let sanitized = str;
        
        // Replace IP addresses
        sanitized = sanitized.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REDACTED]');
        
        // Replace email addresses (keep domain for debugging)
        sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b/g, 
            (match, domain) => `[EMAIL_REDACTED]@${domain}`);
        
        // Replace connection strings
        sanitized = sanitized.replace(/mongodb:\/\/[^\s]+/g, 'mongodb://[REDACTED]');
        sanitized = sanitized.replace(/postgresql:\/\/[^\s]+/g, 'postgresql://[REDACTED]');
        sanitized = sanitized.replace(/mysql:\/\/[^\s]+/g, 'mysql://[REDACTED]');
        
        // Replace Bearer tokens
        sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED]');
        
        return sanitized;
    }

    /**
     * Mask sensitive values while preserving some characters for debugging
     */
    maskSensitiveValue(value) {
        if (typeof value !== 'string' || value.length === 0) return '[REDACTED]';
        
        if (value.length <= 4) {
            return '*'.repeat(value.length);
        }
        
        const start = value.substring(0, 2);
        const end = value.substring(value.length - 2);
        const middle = '*'.repeat(Math.max(0, value.length - 4));
        
        return `${start}${middle}${end}`;
    }

    /**
     * Sanitize Error objects for safe logging
     */
    sanitizeError(error) {
        const sanitized = {
            name: error.name,
            message: this.sanitizeString(error.message),
        };

        // Only include stack trace in development
        if (!this.isProduction) {
            sanitized.stack = this.sanitizeString(error.stack || '');
        }

        // Include custom error properties
        if (error.statusCode) sanitized.statusCode = error.statusCode;
        if (error.status) sanitized.status = error.status;

        return sanitized;
    }

    /**
     * Get client-safe error message
     */
    getClientSafeError(error, defaultMessage = 'An error occurred') {
        if (!error) return { message: defaultMessage };

        // For custom app errors with statusCode, we can send the message
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
            return {
                message: this.sanitizeString(error.message),
                status: error.status || 'fail'
            };
        }

        // For server errors (5xx), don't expose internal details to client
        return {
            message: this.isProduction ? 'Internal server error' : this.sanitizeString(error.message),
            status: 'error'
        };
    }

    /**
     * Secure info logging
     */
    info(message, data = null) {
        const sanitizedMessage = this.sanitizeString(message);
        const sanitizedData = data ? this.sanitizeObject(data) : null;
        
        if (sanitizedData) {
            console.log(`[INFO] ${sanitizedMessage}`, sanitizedData);
        } else {
            console.log(`[INFO] ${sanitizedMessage}`);
        }
    }

    /**
     * Secure error logging
     */
    error(message, error = null, additionalData = null) {
        const sanitizedMessage = this.sanitizeString(message);
        const sanitizedError = error ? this.sanitizeError(error) : null;
        const sanitizedData = additionalData ? this.sanitizeObject(additionalData) : null;
        
        let logData = {};
        if (sanitizedError) logData.error = sanitizedError;
        if (sanitizedData) logData.data = sanitizedData;
        
        if (Object.keys(logData).length > 0) {
            console.error(`[ERROR] ${sanitizedMessage}`, logData);
        } else {
            console.error(`[ERROR] ${sanitizedMessage}`);
        }
    }

    /**
     * Secure warning logging
     */
    warn(message, data = null) {
        const sanitizedMessage = this.sanitizeString(message);
        const sanitizedData = data ? this.sanitizeObject(data) : null;
        
        if (sanitizedData) {
            console.warn(`[WARN] ${sanitizedMessage}`, sanitizedData);
        } else {
            console.warn(`[WARN] ${sanitizedMessage}`);
        }
    }

    /**
     * Secure debug logging (only in development)
     */
    debug(message, data = null) {
        if (this.isProduction) return;
        
        const sanitizedMessage = this.sanitizeString(message);
        const sanitizedData = data ? this.sanitizeObject(data) : null;
        
        if (sanitizedData) {
            console.debug(`[DEBUG] ${sanitizedMessage}`, sanitizedData);
        } else {
            console.debug(`[DEBUG] ${sanitizedMessage}`);
        }
    }
}

// Export singleton instance
const secureLogger = new SecureLogger();
export default secureLogger;