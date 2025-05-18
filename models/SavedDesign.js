const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SavedDesign = sequelize.define('SavedDesign', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
});

module.exports = SavedDesign;