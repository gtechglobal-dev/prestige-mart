const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  costPrice: { type: Number },
  sku: { type: String, required: true, unique: true, trim: true },
  barcode: { type: String },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
  brand: { type: String, trim: true },
  tags: [{ type: String }],
  weight: { type: Number },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  saleCount: { type: Number, default: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true })

productSchema.index({ slug: 1 })
productSchema.index({ sku: 1 })
productSchema.index({ categoryId: 1 })
productSchema.index({ isActive: 1, isFeatured: 1 })
productSchema.index({ isActive: 1, saleCount: -1 })
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' })

module.exports = mongoose.model('Product', productSchema)
