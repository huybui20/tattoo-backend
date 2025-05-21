import { Style } from '../models/index.js';
import { Op } from 'sequelize';

export const getStyles = async (req, res) => {
    try {
        const styles = await Style.findAll();
        res.json(styles);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getStyleById = async (req, res) => {
    try {
        const style = await Style.findByPk(req.params.id);
        if (!style) {
            return res.status(404).json({ message: 'Style not found' });
        }
        res.json(style);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createStyle = async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;

        const styleExists = await Style.findOne({ where: { name } });
        if (styleExists) {
            return res.status(400).json({ message: 'Style with this name already exists' });
        }

        const style = await Style.create({
            name,
            description,
            imageUrl
        });

        res.status(201).json(style);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateStyle = async (req, res) => {
    try {
        const { name, description, imageUrl } = req.body;
        const style = await Style.findByPk(req.params.id);

        if (!style) {
            return res.status(404).json({ message: 'Style not found' });
        }

        if (name && name !== style.name) {
            const nameExists = await Style.findOne({ where: { name } });
            if (nameExists) {
                return res.status(400).json({ message: 'Style name already exists' });
            }
        }

        await style.update({
            name: name || style.name,
            description: description || style.description,
            imageUrl: imageUrl || style.imageUrl
        });

        res.status(201).json(style);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteStyle = async (req, res) => {
    try {
        const style = await Style.findByPk(req.params.id);
        if (!style) {
            return res.status(404).json({ message: 'Style not found' });
        }

        await style.destroy();
        res.json({ message: 'Style deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};