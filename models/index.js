const User = require('./User');
const Style = require('./Style');
const TattooResult = require('./TattooResult');
const SavedDesign = require('./SavedDesign');
const Collection = require('./Collection');

// Define associations
TattooResult.belongsTo(Style);
Style.hasMany(TattooResult);

TattooResult.belongsTo(User, { as: 'creator' });
User.hasMany(TattooResult, { foreignKey: 'creatorId' });

SavedDesign.belongsTo(User);
User.hasMany(SavedDesign);

SavedDesign.belongsTo(TattooResult);
TattooResult.hasMany(SavedDesign);

Collection.belongsTo(User);
User.hasMany(Collection);

Collection.belongsToMany(SavedDesign, { through: 'CollectionSavedDesign' });
SavedDesign.belongsToMany(Collection, { through: 'CollectionSavedDesign' });

module.exports = {
    User,
    Style,
    TattooResult,
    SavedDesign,
    Collection
};