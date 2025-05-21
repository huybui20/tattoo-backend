import rateLimit from 'express-rate-limit';

// General API limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 5 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many login attempts, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter for social auth routes
const socialAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many social login attempts, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export {
    apiLimiter,
    authLimiter,
    socialAuthLimiter
};