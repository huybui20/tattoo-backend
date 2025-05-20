const User = require('./User');
const Style = require('./Style');
const TattooResult = require('./TattooResult');
const SavedDesign = require('./SavedDesign');
const Collection = require('./Collection');

// Define associations
TattooResult.belongsTo(Style, { foreignKey: 'styleId', as: 'style'});
Style.hasMany(TattooResult, { foreignKey: 'styleId', as: 'tattooResult' });

TattooResult.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
User.hasMany(TattooResult, { foreignKey: 'creatorId', as: 'tattooResult' });

SavedDesign.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(SavedDesign, { foreignKey: 'userId', as: 'savedDesign'});

SavedDesign.belongsTo(TattooResult, { foreignKey: 'tattooResultId', as: 'tattooResult' });
TattooResult.hasMany(SavedDesign, { foreignKey: 'tattooResultId', as: 'savedDesign'});

Collection.belongsTo(User, { foreignKey: 'userId', as: 'user'  });
User.hasMany(Collection, { foreignKey: 'userId', as: 'collection' });

Collection.belongsToMany(SavedDesign, { 
    through: 'CollectionSavedDesign',
    foreignKey: 'collectionId',
    as: 'savedDesign' 
});
SavedDesign.belongsToMany(Collection, { 
    through: 'CollectionSavedDesign',
    foreignKey: 'savedDesignId',
    as: 'collection' 
  });
module.exports = {
    User,
    Style,
    TattooResult,
    SavedDesign,
    Collection
};