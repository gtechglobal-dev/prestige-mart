const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  image: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

categorySchema.index({ slug: 1 })
categorySchema.index({ isActive: 1 })

module.exports = mongoose.model('Category', categorySchema)
