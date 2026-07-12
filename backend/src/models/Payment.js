const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  provider: { type: String, enum: ['PAYSTACK', 'FLUTTERWAVE'] },
  metadata: { type: mongoose.Schema.Types.Mixed },
  paidAt: { type: Date },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
}, { timestamps: true })

paymentSchema.index({ reference: 1 })
paymentSchema.index({ orderId: 1 })

module.exports = mongoose.model('Payment', paymentSchema)
