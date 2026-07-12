const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const Coupon = require('../models/Coupon')
const { generateOrderNumber } = require('../utils/generateOrderNumber')

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, note, couponCode } = req.body

    const cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name price images stock')
      .populate('items.variantId')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    let subtotal = 0
    const orderItems = cart.items.map((item) => {
      const price = item.variantId?.price || item.productId.price
      subtotal += price * item.quantity
      return {
        productId: item.productId._id,
        variantId: item.variantId?._id || null,
        quantity: item.quantity,
        price,
        name: item.productId.name,
        image: item.productId.images[0] || null,
        variantName: item.variantId?.name || null,
      }
    })

    let discount = 0
    let couponId = null
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode })
      if (coupon && coupon.isActive && coupon.usedCount < coupon.maxUses && (!coupon.expiresAt || coupon.expiresAt > new Date()) && subtotal >= coupon.minOrder) {
        discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value
        couponId = coupon._id
        await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } })
      }
    }

    const shippingCost = subtotal >= 50000 ? 0 : 2500
    const tax = subtotal * 0.075
    const total = subtotal - discount + shippingCost + tax

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      subtotal,
      shippingCost,
      tax,
      discount,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      note,
      couponId,
      items: orderItems,
    })

    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.productId._id },
        { $inc: { stock: -item.quantity, saleCount: item.quantity } }
      )
    }

    await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } })

    res.status(201).json({ message: 'Order created successfully', order })
  } catch (error) {
    next(error)
  }
}

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
      .populate('items.productId', 'name slug images')
    res.json(orders)
  } catch (error) {
    next(error)
  }
}

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('items.productId', 'name slug images')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (error) {
    next(error)
  }
}

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Order cannot be cancelled' })
    }

    order.status = 'CANCELLED'
    order.cancelledAt = new Date()
    order.cancelReason = req.body.reason || 'Cancelled by customer'
    await order.save()

    for (const item of order.items) {
      if (item.productId) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity, saleCount: -item.quantity } }
        )
      }
    }

    res.json({ message: 'Order cancelled' })
  } catch (error) {
    next(error)
  }
}
