const { Schema, model } = require('mongoose');
module.exports = model('Crop', new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true },
  name: { type: String, required: true, trim: true },
  sownOn: Date,
  areaAcres: { type: Number, min: 0 },
  status: { type: String, enum: ['growing', 'harvested', 'failed'], default: 'growing' },
  soil: { ph: Number, n: Number, p: Number, k: Number, organicMatter: Number, moisture: Number },
  logs: [{ note: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true }));
