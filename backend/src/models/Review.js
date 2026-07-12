const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String },
  isVerified: { type: Boolean, default: false },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

reviewSchema.index({ productId: 1 })
reviewSchema.index({ userId: 1 })
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)
