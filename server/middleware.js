import rateLimit from 'express-rate-limit';
import { verifyToken, getUserById } from './auth.js';

// Authentication middleware
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = verifyToken(token);
            req.user = decoded;
        } catch (error) {
            // Token is invalid, but we don't fail the request
            req.user = null;
        }
    } else {
        req.user = null;
    }
    
    next();
};

// Rate limiting for authentication endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for password reset
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for general API endpoints
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for contact form
export const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 contact form submissions per hour
    message: {
        success: false,
        message: 'Too many contact form submissions, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Admin middleware (for future admin routes)
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    // In a real application, you would check if the user has admin role
    // For now, we'll just check if the user exists
    try {
        const user = getUserById(req.user.userId);
        // Add admin role check here when you implement roles
        // if (!user.isAdmin) {
        //     return res.status(403).json({ 
        //         success: false, 
        //         message: 'Admin access required' 
        //     });
        // }
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = 500;
    let message = 'Internal server error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Not found';
    } else if (err.message) {
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Generate unique request ID for tracking
    const requestId = Math.random().toString(36).substr(2, 9);
    req.requestId = requestId;
    
    // Create a separator for better visibility
    console.log('\n' + '🔥'.repeat(40));
    console.log(`🚀 [${timestamp}] REQUEST #${requestId}`);
    console.log(`🌐 ${method} ${url}`);
    console.log(`📍 Client IP: ${ip}`);
    console.log(`📱 User-Agent: ${userAgent}`);
    console.log(`🔗 Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log(`🆔 Request ID: ${requestId}`);
    
    // Enhanced logging for authentication endpoints
    if (url.includes('/auth/')) {
        console.log(`\n🔐 AUTHENTICATION REQUEST DETECTED #${requestId}`);
        console.log(`📍 Client IP: ${ip}`);
        console.log(`⏰ Request Time: ${timestamp}`);
        console.log(`🎯 Endpoint: ${method} ${url}`);
        console.log(`🆔 Request ID: ${requestId}`);
        
        // Log request body for auth endpoints (excluding sensitive data)
        if (req.body && Object.keys(req.body).length > 0) {
            const sanitizedBody = { ...req.body };
            if (sanitizedBody.password) {
                sanitizedBody.password = '[HIDDEN]';
            }
            console.log(`📝 Request Payload:`, JSON.stringify(sanitizedBody, null, 2));
        } else {
            console.log(`📝 Request Payload: No body data`);
        }
        
        // Log headers for debugging
        console.log(`📋 Headers:`, {
            'Content-Type': req.get('Content-Type'),
            'Authorization': req.get('Authorization') ? '[PRESENT]' : '[NOT PRESENT]',
            'Origin': req.get('Origin'),
            'Referer': req.get('Referer')
        });
    }
    
    // Log response when it finishes
    res.on('finish', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = res.statusCode;
        const statusColor = getStatusColor(statusCode);
        
        console.log(`\n📊 RESPONSE SENT #${requestId}:`);
        console.log(`✅ Status: ${statusColor}${statusCode}${'\x1b[0m'}`);
        console.log(`⏱️ Duration: ${duration}ms`);
        console.log(`📍 Client IP: ${ip}`);
        console.log(`🔗 Endpoint: ${method} ${url}`);
        console.log(`🆔 Request ID: ${requestId}`);
        
        // Enhanced logging for authentication endpoints
        if (url.includes('/auth/')) {
            console.log(`\n🔐 AUTHENTICATION RESPONSE #${requestId}:`);
            console.log(`📊 Status Code: ${statusCode}`);
            console.log(`⏱️ Response Time: ${duration}ms`);
            console.log(`🆔 Request ID: ${requestId}`);
            if (statusCode >= 200 && statusCode < 300) {
                console.log(`✅ Authentication Success`);
            } else {
                console.log(`❌ Authentication Failed`);
            }
        }
        
        // Log additional details for errors
        if (statusCode >= 400) {
            console.log(`\n❌ ERROR RESPONSE #${requestId}:`);
            console.log(`📊 Status: ${statusCode}`);
            console.log(`💬 Message: ${res.statusMessage || 'Unknown error'}`);
            console.log(`📍 Client IP: ${ip}`);
            console.log(`🆔 Request ID: ${requestId}`);
        }
        
        console.log('🔥'.repeat(40) + '\n');
    });
    
    next();
};

// Helper function to colorize status codes
function getStatusColor(statusCode) {
    if (statusCode >= 200 && statusCode < 300) return '\x1b[32m'; // Green for success
    if (statusCode >= 300 && statusCode < 400) return '\x1b[33m'; // Yellow for redirect
    if (statusCode >= 400 && statusCode < 500) return '\x1b[31m'; // Red for client error
    if (statusCode >= 500) return '\x1b[35m'; // Magenta for server error
    return '\x1b[0m'; // Default color
}
