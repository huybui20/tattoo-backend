import express from 'express';
const router = express.Router();

// Import all route modules
import authRoutes from './auth.js';
import styleRoutes from './styles.js';
import tattooRoutes from './tattoos.js';
import collectionRoutes from './collections.js';
// Mount routes
router.use('/auth', authRoutes);
router.use('/styles', styleRoutes);
router.use('/tattoos', tattooRoutes);
router.use('/collections', collectionRoutes);
// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

export default router;