const { TattooResult, Style, User, SavedDesign } = require('../models');
const Replicate = require('replicate');
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});
const { downloadAndSaveImage } = require('../utils/imageUtils');
const { sequelize } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { readFile } = require("node:fs/promises");
const DEFAULT_NEGATIVE_PROMPT = "blurry, low quality, distorted, disfigured, ugly, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, mutated hands and fingers, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation";

exports.generateTattoo = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            prompt,
            styleName,
            negativePrompt = DEFAULT_NEGATIVE_PROMPT,
            width = 512,
            height = 512,
            scheduler = 'K_EULER',
            numOutputs = 1,
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
        const uniqueId = uuidv4();
        const basepath= `${Date.now()}_${uniqueId}`;
        for (const [index, item] of Object.entries(output)) {
            const localImagePath = await downloadAndSaveImage(item, index, basepath);

            const tattooResult = await TattooResult.create({
                prompt,
                StyleId: style.id,
                mode,
                negativePrompt,
                width,
                height,
                scheduler,
                numOutputs,
                guidanceScale,
                numInferenceSteps,
                strength,
                creatorId: req.user?.id || null,
                imageUrl: localImagePath,
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

exports.getTattooResults = async (req, res) => {
    try {
        const tattooResults = await TattooResult.findAll({
            include: [
                { model: Style },
                { model: User, as: 'creator', attributes: ['username'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(tattooResults);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getTattooById = async (req, res) => {
    try {
        const tattooResult = await TattooResult.findByPk(req.params.id, {
            include: [
                { model: Style },
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

exports.saveDesign = async (req, res) => {
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

exports.unsaveDesign = async (req, res) => {
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

exports.getSavedDesigns = async (req, res) => {
    try {
        const savedDesigns = await SavedDesign.findAll({
        where: { userId: req.user.id },
        include: [
            {
            model: TattooResult,
                include: [
                    { model: Style },
                    { model: User, as: 'creator', attributes: ['username'] }
                ]
            }
        ],
        order: [['createdAt', 'DESC']]
        });
        res.json(savedDesigns);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};