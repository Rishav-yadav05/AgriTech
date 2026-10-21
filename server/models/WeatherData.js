const { Schema, model } = require('mongoose');
module.exports = model('WeatherData', new Schema({
  farm: { type: Schema.Types.ObjectId, ref: 'Farm', required: true, unique: true },
  data: Schema.Types.Mixed, fetchedAt: { type: Date, default: Date.now }
}));
