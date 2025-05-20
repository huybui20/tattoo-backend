const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const styleRoutes = require('./styles');
const tattooRoutes = require('./tattoos');
const collectionRoutes = require('./collections');
// Mount routes
router.use('/auth', authRoutes);
router.use('/styles', styleRoutes);
router.use('/tattoos', tattooRoutes);
router.use('/collections', collectionRoutes);
// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = router;