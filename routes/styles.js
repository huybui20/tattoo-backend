const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
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

// Protected routes (admin only)
router.post('/', protect, createStyle);
router.put('/:id', protect, updateStyle);
router.delete('/:id', protect, deleteStyle);

module.exports = router;