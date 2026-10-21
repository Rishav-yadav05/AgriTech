const { Schema, model } = require('mongoose');
module.exports = model('Farm', new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  village: String,
  lat: { type: Number, required: true, min: -90, max: 90 },
  lon: { type: Number, required: true, min: -180, max: 180 },
  areaAcres: { type: Number, min: 0, default: 1 },
  soilType: { type: String, enum: ['alluvial', 'black', 'red', 'laterite', 'sandy', 'loamy'], default: 'loamy' }
}, { timestamps: true }));
