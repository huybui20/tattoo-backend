import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import session from 'express-session';
import passport from 'passport';
import { apiLimiter } from './config/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Connect to database
connectDB();
app.set('trust proxy', 1);
// Apply rate limiting to all routes
app.use(apiLimiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Google/Facebook OAuth
app.use(session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}));
app.use(passport.initialize());
app.use(passport.session());
// Mount all routes
app.use('/api', routes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        rateLimit: {
            limit: res.getHeader('RateLimit-Limit'),
            remaining: res.getHeader('RateLimit-Remaining'),
            reset: res.getHeader('RateLimit-Reset')
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);
});