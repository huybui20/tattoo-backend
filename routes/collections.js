import express from 'express';
const router = express.Router();
import { protect } from '../middleware/auth.js';
import {
    getCollections,
    getCollectionById,
    createCollection,
    updateCollection,
    deleteCollection,
    addDesignToCollection,
    removeDesignFromCollection
} from '../controllers/collectionController.js';

// All collection routes require authentication
router.use(protect);

router.get('/', getCollections);
router.get('/:id', getCollectionById);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);
router.post('/:id/designs', addDesignToCollection);
router.delete('/:id/designs/:designId', removeDesignFromCollection);

export default router;