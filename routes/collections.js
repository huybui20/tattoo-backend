const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
    addDesignToCollection,
    removeDesignFromCollection
} = require('../controllers/collectionController');

// All collection routes require authentication
router.use(protect);

router.get('/', getCollections);
router.get('/:id', getCollectionById);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);
router.post('/:id/designs', addDesignToCollection);
router.delete('/:id/designs/:designId', removeDesignFromCollection);

module.exports = router;