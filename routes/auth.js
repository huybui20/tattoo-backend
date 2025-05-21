import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  socialAuthSuccess,
  socialAuthFailed
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, socialAuthLimiter } from '../config/rateLimiter.js';
import '../services/passport.js'; // Just import to initialize

const router = express.Router();

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

// Facebook routes with social auth rate limiting
router.get('/facebook', 
  socialAuthLimiter,
  passport.authenticate('facebook', {
    scope: ['public_profile']
  })
);
router.get('/facebook/callback',
  socialAuthLimiter,
  passport.authenticate('facebook', {
    failureRedirect: '/api/auth/login/failed',
    successRedirect: '/api/auth/login/success'
  })
);

// Social auth results
router.get('/login/failed', socialAuthFailed);
router.get('/login/success', socialAuthSuccess);

// Protected routes
router.get('/logout', protect, logout); // No need for `protect` middleware if using sessions

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
