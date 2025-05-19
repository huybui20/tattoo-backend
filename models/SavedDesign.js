const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SavedDesign = sequelize.define('SavedDesign', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    }
});

module.exports = SavedDesign;