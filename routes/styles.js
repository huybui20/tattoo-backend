import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
    getStyles,
    getStyleById,
    createStyle,
    updateStyle,
    deleteStyle
} from '../controllers/styleController.js';

// Public routes
router.get('/', getStyles);
router.get('/:id', getStyleById);

// Admin routes
router.post('/', protect, authorize('admin'), createStyle);
router.put('/:id', protect, authorize('admin'), updateStyle);
router.delete('/:id', protect, authorize('admin'), deleteStyle);

export default router;