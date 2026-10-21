const { Schema, model } = require('mongoose');
module.exports = model('Order', new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{ resource: { type: Schema.Types.ObjectId, ref: 'Resource' }, name: String, qty: Number, price: Number }],
  total: Number, address: String,
  status: { type: String, enum: ['placed', 'approved', 'shipped', 'delivered', 'cancelled'], default: 'placed' }
}, { timestamps: true }));
