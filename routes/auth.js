const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, socialAuthSuccess, socialAuthFailed } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('passport');
const { authLimiter, socialAuthLimiter } = require('../config/rateLimiter');
require('../services/passport');
// Public routes with rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
// Google routes with social auth rate limiting
router.get('/google', 
    socialAuthLimiter,
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);
router.get('/google/callback',
    socialAuthLimiter,
    passport.authenticate('google', {
        failureRedirect: '/api/auth/login/failed',
        successRedirect: '/api/auth/login/success'
    })
);
router.get('/facebook', 
    socialAuthLimiter,
    passport.authenticate('facebook', {
        scope: ['public_profile', 'email']
    })
);
router.get('/facebook/callback',
    socialAuthLimiter,
    passport.authenticate('facebook', {
        failureRedirect: '/api/auth/login/failed',
        successRedirect: '/api/auth/login/success'
    })
);
router.get('/login/failed', socialAuthFailed);
router.get('/login/success', socialAuthSuccess);
// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;