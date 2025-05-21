import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
const Collection = sequelize.define('Collection', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

export default Collection;