const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Collection = sequelize.define('Collection', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Collection;