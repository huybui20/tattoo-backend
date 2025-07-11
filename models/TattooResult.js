import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const TattooResult = sequelize.define('TattooResult', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    prompt: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    mode: {
        type: DataTypes.ENUM('txt2img', 'img2img'),
        defaultValue: 'txt2img'
    },
    negativePrompt: {
        type: DataTypes.TEXT
    },
    width: {
        type: DataTypes.INTEGER,
        defaultValue: 512
    },
    height: {
        type: DataTypes.INTEGER,
        defaultValue: 512
    },
    scheduler: {
        type: DataTypes.STRING,
        defaultValue: 'K_EULER'
    },
    guidanceScale: {
        type: DataTypes.FLOAT,
        defaultValue: 7.0
    },
    numInferenceSteps: {
        type: DataTypes.INTEGER,
        defaultValue: 30
    },
    strength: {
        type: DataTypes.FLOAT,
        defaultValue: 0.6
    },
    imageUrl: {
        type: DataTypes.STRING
    },
});

export default TattooResult;