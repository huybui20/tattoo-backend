import { Collection, SavedDesign, TattooResult, Style, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getCollections = async (req, res) => {
    try {
        const collections = await Collection.findAll({
            where: { userId: req.user.id },
            include: [
                { model: SavedDesign, as: 'savedDesign', attributes: ['id'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(collections);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getCollectionById = async (req, res) => {
    try {
        const collection = await Collection.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            },
            include: [
                { model: SavedDesign, as: 'savedDesign', attributes: ['id'] }
            ]
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        res.json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createCollection = async (req, res) => {
    try {
        const { name } = req.body;

        const collection = await Collection.create({
            name,
            userId: req.user.id
        });

        res.status(201).json(collection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.errors ? error.errors.map(e => e.message) : null
        });
    }
};

export const updateCollection = async (req, res) => {
    try {
        const { name } = req.body;
        const collection = await Collection.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        await collection.update({ name });
        res.json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCollection = async (req, res) => {
    try {
        const collection = await Collection.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        await collection.destroy();
        res.json({ message: 'Collection deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const addDesignToCollection = async (req, res) => {
    try {
        const { designId } = req.body;
        const collection = await Collection.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        const savedDesign = await SavedDesign.findOne({
            where: {
                id: designId,
                userId: req.user.id
            }
        });

        if (!savedDesign) {
            return res.status(404).json({ message: 'Saved design not found' });
        }

        await collection.addSavedDesign(savedDesign);
        res.json({ message: 'Design added to collection successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeDesignFromCollection = async (req, res) => {
    try {
        const collection = await Collection.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        const savedDesign = await SavedDesign.findOne({
            where: {
                id: req.params.designId,
                userId: req.user.id
            }
        });

        if (!savedDesign) {
            return res.status(404).json({ message: 'Saved design not found' });
        }

        await collection.removeSavedDesign(savedDesign);
        res.json({ message: 'Design removed from collection successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};