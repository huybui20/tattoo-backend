const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Style = sequelize.define('Style', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    imageUrl: {
        type: DataTypes.STRING
    }
});

module.exports = Style;