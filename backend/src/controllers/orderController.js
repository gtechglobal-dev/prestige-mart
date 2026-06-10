const prisma = require('../utils/prisma')
const { generateOrderNumber } = require('../utils/generateOrderNumber')

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, billingAddress, note, couponCode } = req.body

    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, price: true, images: true, stock: true } }, variant: true }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    let subtotal = 0
    const orderItems = cart.items.map((item) => {
      const price = item.variant?.price || item.product.price
      subtotal += price * item.quantity
      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price,
        name: item.product.name,
        image: item.product.images[0] || null,
        variantName: item.variant?.name || null,
      }
    })

    let discount = 0
    let couponId = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon && coupon.isActive && coupon.usedCount < coupon.maxUses && (!coupon.expiresAt || coupon.expiresAt > new Date()) && subtotal >= coupon.minOrder) {
        discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value
        couponId = coupon.id
        await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })
      }
    }

    const shippingCost = subtotal >= 50000 ? 0 : 2500
    const tax = subtotal * 0.075
    const total = subtotal - discount + shippingCost + tax

    const order = await prisma.order.create({
      data: {
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
        items: { create: orderItems }
      },
      include: { items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } } }
    })

    for (const item of cart.items) {
      await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, saleCount: { increment: item.quantity } } })
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

    res.status(201).json({ message: 'Order created successfully', order })
  } catch (error) {
    next(error)
  }
}

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (error) {
    next(error)
  }
}

exports.getOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: { include: { product: { select: { id: true, name: true, slug: true, images: true } } } } }
    })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (error) {
    next(error)
  }
}

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { items: true }
    })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Order cannot be cancelled' })
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: req.body.reason || 'Cancelled by customer' }
    })

    for (const item of order.items) {
      await prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity }, saleCount: { decrement: item.quantity } } })
    }

    res.json({ message: 'Order cancelled' })
  } catch (error) {
    next(error)
  }
}
