const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String },
  variantName: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
}, { timestamps: true })

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'], default: 'PENDING' },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  paymentProvider: { type: String, enum: ['PAYSTACK', 'FLUTTERWAVE'] },
  paymentRef: { type: String },
  paidAt: { type: Date },
  shippingAddress: { type: mongoose.Schema.Types.Mixed },
  billingAddress: { type: mongoose.Schema.Types.Mixed },
  note: { type: String },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  items: [orderItemSchema],
}, { timestamps: true })

orderSchema.index({ userId: 1 })
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ paymentRef: 1 })
orderSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Order', orderSchema)
