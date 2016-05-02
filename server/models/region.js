var mongoose = require('mongoose'),
    OrderSchema,
    UnitSchema,
    RegionSchema;

OrderSchema = new mongoose.Schema({
    source: String,
    target: String,
    action: String,
    failed: {
        type: Boolean,
        default: false
    },
    details: String
}, { _id: false });

UnitSchema = new mongoose.Schema({
    type: Number,
    owner: String,
    order: OrderSchema
}, { _id: false });

RegionSchema = new mongoose.Schema({
    r: String,
    unit: UnitSchema,
    dislodged: UnitSchema,
    sc: String
}, { _id: false });
RegionSchema.add({ sr: [ RegionSchema ] });

module.exports = mongoose.model('Region', RegionSchema);
