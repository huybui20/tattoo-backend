const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
    getStyles,
    getStyle,
    createStyle,
    updateStyle,
    deleteStyle
} = require('../controllers/styleController');

// Public routes
router.get('/', getStyles);
router.get('/:id', getStyle);

// Admin routes
router.post('/', protect, authorize('admin'), createStyle);
router.put('/:id', protect, authorize('admin'), updateStyle);
router.delete('/:id', protect, authorize('admin'), deleteStyle);

module.exports = router;