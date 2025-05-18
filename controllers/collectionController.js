const { Collection, SavedDesign, TattooResult, Style, User } = require('../models');
const { Op } = require('sequelize');

exports.getCollections = async (req, res) => {
    try {
        const collections = await Collection.findAll({
        where: { userId: req.user.id },
        include: [
            {
            model: SavedDesign,
            include: [
                {
                model: TattooResult,
                include: [
                    { model: Style },
                    { model: User, as: 'creator', attributes: ['username'] }
                ]
                }
            ]
            }
        ],
        order: [['createdAt', 'DESC']]
        });
        res.json(collections);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getCollection = async (req, res) => {
    try {
        const collection = await Collection.findOne({
        where: {
            id: req.params.id,
            userId: req.user.id
        },
        include: [
            {
            model: SavedDesign,
            include: [
                {
                model: TattooResult,
                include: [
                    { model: Style },
                    { model: User, as: 'creator', attributes: ['username'] }
                ]
                }
            ]
            }
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

exports.createCollection = async (req, res) => {
    try {
        const { name } = req.body;

        const collection = await Collection.create({
        name,
        userId: req.user.id
        });

        res.status(201).json(collection);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateCollection = async (req, res) => {
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

exports.deleteCollection = async (req, res) => {
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

exports.addDesignToCollection = async (req, res) => {
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

exports.removeDesignFromCollection = async (req, res) => {
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