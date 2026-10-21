const { Schema, model } = require('mongoose');
module.exports = model('Post', new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['forum', 'consult', 'pestAlert'], default: 'forum', index: true },
  title: { type: String, required: true, trim: true }, body: { type: String, required: true },
  replies: [{ author: { type: Schema.Types.ObjectId, ref: 'User' }, body: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true }));
