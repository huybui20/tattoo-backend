import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
    generateTattoo,
    getTattooResults,
    getTattooById,
    saveDesign,
    unsaveDesign,
    getSavedDesigns,
    getSavedDesignsById,
} from '../controllers/tattooController.js';

// Public routes
router.get('/', getTattooResults);
router.get('/:id', getTattooById);
router.post('/generate', generateTattoo);
// User routes
router.post('/:id/save', protect, saveDesign);
router.delete('/:id/unsave', protect, unsaveDesign);
router.get('/savedDesigns', protect, getSavedDesigns);
router.get('/savedDesigns/:id', protect, getSavedDesignsById);
// Admin routes
router.delete('/:id', protect, authorize('admin'), async (req, res) => {});

export default router;