import { TattooResult, Style, User, SavedDesign } from '../models/index.js';
import Replicate from 'replicate';
import { uploadToCloudinary } from '../utils/imageUtils.js';
import { sequelize } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { readFile } from 'node:fs/promises';

const DEFAULT_NEGATIVE_PROMPT = "blurry, low quality, distorted, disfigured, ugly, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, mutated hands and fingers, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

export const generateTattoo = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            prompt,
            styleName,
            negativePrompt,
            width = 512,
            height = 512,
            scheduler = 'K_EULER',
            numOutputs = 2,
            guidanceScale = 7.0,
            numInferenceSteps = 30,
            strength = 0.6,
            referenceImage
        } = req.body;
        const style = await Style.findOne({ 
            where: { name: styleName },
            transaction 
        });
        
        if (!style) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Style not found' });
        }

        const fullPrompt = `(((neutral white background))), set on a pure white background, a (${style.name} tattoo design) of ${prompt}`;

        const replicateInput = {
            prompt: fullPrompt,
            negative_prompt: negativePrompt,
            width,
            height,
            style: styleName,
            scheduler,
            num_outputs: numOutputs,
            guidance_scale: guidanceScale,
            num_inference_steps: numInferenceSteps
        };
        const mode = referenceImage ? 'img2img' : 'txt2img';

        let image = referenceImage;
        if (req.file) {
            const imagePath = req.file.path;
            image = await readFile(imagePath);
        } else if (referenceImage) {
            if (!referenceImage.startsWith('http://') && !referenceImage.startsWith('https://')) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Invalid reference image format. Must be a URL or an image file.' });
            }
            image = referenceImage;
        }
        if (mode === 'img2img') {
            replicateInput.image = image;
            replicateInput.strength = strength;
        }
        const output = await replicate.run(
            "windxtech/tattoo-generator:0fe0fd450695b2fd99305d27a07ee6349943c200dc849d07633a98c24daef9a8",
            { input: replicateInput }
        );
        const result = {};
        for (const [index, item] of Object.entries(output)) {
            const cloudinaryUrl = await uploadToCloudinary(item);
            // const cloudinaryUrl ="fefesfesfesfe";
            const tattooResult = await TattooResult.create({
                prompt,
                styleId: style.id,
                mode,
                negativePrompt,
                width,
                height,
                scheduler,
                guidanceScale,
                numInferenceSteps,
                strength,
                creatorId: req.user?.id || null,
                imageUrl: cloudinaryUrl,
            }, { transaction });
            result[index] = tattooResult;
        }
        await transaction.commit();
        res.status(201).json(result);
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ message: error.message });
    }
};
export const getTattooResults = async (req, res) => {
    try {
        const tattooResults = await TattooResult.findAll({
            include: [
                { model: Style, as: 'style', attributes: ['name'] },
                { model: User, as: 'creator', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(tattooResults);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getTattooById = async (req, res) => {
    try {
        const tattooResult = await TattooResult.findByPk(req.params.id, {
            include: [
                { model: Style, as: 'style', attributes: ['name'] },
                { model: User, as: 'creator', attributes: ['username'] }
            ]
        });

        if (!tattooResult) {
            return res.status(404).json({ message: 'Tattoo result not found' });
        }

        res.json(tattooResult);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const saveDesign = async (req, res) => {
    try {
        const tattooResult = await TattooResult.findByPk(req.params.id);
        if (!tattooResult) {
            return res.status(404).json({ message: 'Tattoo result not found' });
        }

        const existingSave = await SavedDesign.findOne({
            where: {
                userId: req.user.id,
                tattooResultId: req.params.id
            }
        });

        if (existingSave) {
            return res.status(400).json({ message: 'Design already saved' });
        }

        const savedDesign = await SavedDesign.create({
            userId: req.user.id,
            tattooResultId: req.params.id
        });

        res.status(201).json(savedDesign);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const unsaveDesign = async (req, res) => {
    try {
        const savedDesign = await SavedDesign.findOne({
            where: {
                userId: req.user.id,
                tattooResultId: req.params.id
            }
        });

        if (!savedDesign) {
            return res.status(404).json({ message: 'Saved design not found' });
        }

        await savedDesign.destroy();
        res.json({ message: 'Design unsaved successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getSavedDesigns = async (req, res) => {
    try {
        const savedDesigns = await SavedDesign.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: TattooResult,
                    as: 'tattooResult',
                    attributes: ['imageUrl'],
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(savedDesigns);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getSavedDesignsById = async (req, res) => {
    try {
        const savedDesign = await SavedDesign.findByPk(req.params.id, {
            include: [
                { model: TattooResult, as: 'tattooResult', attributes: ['id'] },
                { model: User, as: 'user', attributes: ['username'] }
            ]
        });

        if (!savedDesign) {
            return res.status(404).json({ message: 'Saved Design not found' });
        }
        res.json(savedDesign);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};