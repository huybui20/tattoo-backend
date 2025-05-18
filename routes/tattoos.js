const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    generateTattoo,
    getTattooResults,
    getTattooById,
    saveDesign,
    unsaveDesign,
    getSavedDesigns
} = require('../controllers/tattooController');

// Public routes
router.get('/', getTattooResults);
router.get('/:id', getTattooById);

// Protected routes
router.post('/generate', protect, generateTattoo);
router.post('/:id/save', protect, saveDesign);
router.delete('/:id/unsave', protect, unsaveDesign);
router.get('/saved/designs', protect, getSavedDesigns);

module.exports = router;