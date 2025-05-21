import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const SavedDesign = sequelize.define('SavedDesign', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    }
});

export default SavedDesign;