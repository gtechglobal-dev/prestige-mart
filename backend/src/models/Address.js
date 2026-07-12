const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  label: { type: String },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: 'Nigeria' },
  zip: { type: String },
  isDefault: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

addressSchema.index({ userId: 1 })

module.exports = mongoose.model('Address', addressSchema)
