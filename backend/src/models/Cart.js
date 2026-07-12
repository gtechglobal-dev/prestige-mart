const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  quantity: { type: Number, required: true, default: 1 },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
}, { timestamps: true })

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  sessionId: { type: String },
  items: [cartItemSchema],
}, { timestamps: true })

cartSchema.index({ userId: 1 })

module.exports = mongoose.model('Cart', cartSchema)
