const Coupon = require('../models/Coupon')

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body
    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (!coupon) return res.status(404).json({ message: 'Coupon not found', valid: false })
    if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is inactive', valid: false })
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ message: 'Coupon has expired', valid: false })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ message: 'Coupon has expired', valid: false })
    if (subtotal < coupon.minOrder) return res.status(400).json({ message: `Minimum order of ₦${coupon.minOrder.toLocaleString()} required`, valid: false })

    const discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal)
    res.json({ valid: true, coupon: { ...coupon.toObject(), id: coupon._id, discount } })
  } catch (error) {
    next(error)
  }
}
