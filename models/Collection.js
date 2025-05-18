const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Collection = sequelize.define('Collection', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Collection;