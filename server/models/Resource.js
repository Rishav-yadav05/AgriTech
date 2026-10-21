const { Schema, model } = require('mongoose');
module.exports = model('Resource', new Schema({
  name: { type: String, required: true }, description: String,
  category: { type: String, enum: ['seed', 'fertilizer', 'pesticide', 'equipment'], required: true },
  price: { type: Number, required: true, min: 0 }, stock: { type: Number, default: 0, min: 0 }
}, { timestamps: true }));
