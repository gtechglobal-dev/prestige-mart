const mongoose = require('mongoose')

const productVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number },
  stock: { type: Number, default: 0 },
  sku: { type: String },
  color: { type: String },
  size: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true })

productVariantSchema.index({ productId: 1 })
productVariantSchema.index({ productId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('ProductVariant', productVariantSchema)
