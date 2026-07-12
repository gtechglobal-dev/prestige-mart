const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Coupon = require('../models/Coupon')
const { generateOrderNumber } = require('../utils/generateOrderNumber')
const bcrypt = require('bcryptjs')

exports.getDashboard = async (req, res, next) => {
  try {
    const [paidOrders, ordersCount, customersCount, productsCount, recentOrders] = await Promise.all([
      Order.find({ paymentStatus: 'PAID' }).select('total createdAt'),
      Order.countDocuments(),
      User.countDocuments({ role: 'CUSTOMER' }),
      Product.countDocuments({ isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(10)
        .populate('userId', 'firstName lastName email')
    ])

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0)

    res.json({
      totalRevenue,
      ordersCount,
      customersCount,
      productsCount,
      recentOrders,
      revenueData: []
    })
  } catch (error) {
    next(error)
  }
}

exports.getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = status ? { status } : {}
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [orders, total] = await Promise.all([
      Order.find(where).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
        .populate('userId', 'firstName lastName email phone'),
      Order.countDocuments(where)
    ])
    res.json({ orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    next(error)
  }
}

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body
    const updateData = { status }
    if (status === 'DELIVERED') updateData.deliveredAt = new Date()
    if (status === 'CANCELLED') { updateData.cancelledAt = new Date(); updateData.cancelReason = note }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('userId')

    if (status === 'CANCELLED' && order) {
      for (const item of order.items) {
        if (item.productId) {
          await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })
        }
      }
    }

    res.json({ message: 'Order updated', order })
  } catch (error) {
    next(error)
  }
}

exports.getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [customers, total] = await Promise.all([
      User.find({ role: 'CUSTOMER' }).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments({ role: 'CUSTOMER' })
    ])

    const customersWithCounts = await Promise.all(customers.map(async (c) => {
      const ordersCount = await Order.countDocuments({ userId: c._id })
      return { ...c.toObject(), id: c._id, _count: { orders: ordersCount } }
    }))

    res.json({ customers: customersWithCounts, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    next(error)
  }
}

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'CUSTOMER' }).select('-password')
    if (!customer) return res.status(404).json({ message: 'Customer not found' })

    const orders = await Order.find({ userId: customer._id }).sort({ createdAt: -1 }).limit(20)
    res.json({ ...customer.toObject(), id: customer._id, orders })
  } catch (error) {
    next(error)
  }
}

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, comparePrice, costPrice, sku, stock, images, categoryId, brand, tags, isFeatured, variants } = req.body
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

    const ProductVariant = require('../models/ProductVariant')

    const product = await Product.create({
      name, slug, description, price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      sku, stock: parseInt(stock) || 0, images: images || [],
      categoryId, brand, tags: tags || [], isFeatured: isFeatured || false,
    })

    if (variants && variants.length > 0) {
      const variantDocs = variants.map(v => ({
        ...v, productId: product._id,
        price: v.price ? parseFloat(v.price) : null,
        stock: parseInt(v.stock) || 0
      }))
      await ProductVariant.insertMany(variantDocs)
    }

    const populated = await Product.findById(product._id).populate('categoryId', 'name slug')
    const productVariants = await ProductVariant.find({ productId: product._id })

    res.status(201).json({ message: 'Product created', product: { ...populated.toObject(), id: populated._id, variants: productVariants } })
  } catch (error) {
    next(error)
  }
}

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, comparePrice, costPrice, sku, stock, images, categoryId, brand, tags, isFeatured } = req.body
    const updateData = {}
    if (name) { updateData.name = name; updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36) }
    if (description !== undefined) updateData.description = description
    if (price) updateData.price = parseFloat(price)
    if (comparePrice !== undefined) updateData.comparePrice = comparePrice ? parseFloat(comparePrice) : null
    if (costPrice !== undefined) updateData.costPrice = costPrice ? parseFloat(costPrice) : null
    if (sku) updateData.sku = sku
    if (stock !== undefined) updateData.stock = parseInt(stock)
    if (images) updateData.images = images
    if (categoryId) updateData.categoryId = categoryId
    if (brand !== undefined) updateData.brand = brand
    if (tags) updateData.tags = tags
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('categoryId', 'name slug')
    const ProductVariant = require('../models/ProductVariant')
    const variants = await ProductVariant.find({ productId: product._id })

    res.json({ message: 'Product updated', product: { ...product.toObject(), id: product._id, variants } })
  } catch (error) {
    next(error)
  }
}

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Product deleted' })
  } catch (error) {
    next(error)
  }
}

exports.createCoupon = async (req, res, next) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt } = req.body
    const coupon = await Coupon.create({ code: code.toUpperCase(), type, value: parseFloat(value), minOrder: parseFloat(minOrder || 0), maxUses: parseInt(maxUses || 100), expiresAt: expiresAt ? new Date(expiresAt) : null })
    res.status(201).json({ message: 'Coupon created', coupon })
  } catch (error) {
    next(error)
  }
}

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.json(coupons)
  } catch (error) {
    next(error)
  }
}

exports.getAnalytics = async (req, res, next) => {
  try {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [thisMonthOrders, lastMonthOrders, topProducts, categoryStats] = await Promise.all([
      Order.find({ paymentStatus: 'PAID', createdAt: { $gte: thisMonth } }).select('total'),
      Order.find({ paymentStatus: 'PAID', createdAt: { $gte: lastMonth, $lt: thisMonth } }).select('total'),
      Product.find().sort({ saleCount: -1 }).limit(10).select('name saleCount price images stock'),
      Category.find().select('name')
    ])

    const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.total, 0)
    const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.total, 0)

    const categoryStatsWithCount = await Promise.all(categoryStats.map(async (c) => {
      const count = await Product.countDocuments({ categoryId: c._id, isActive: true })
      return { id: c._id, name: c.name, _count: { products: count } }
    }))

    res.json({ thisMonthRevenue, lastMonthRevenue, topProducts, categoryStats: categoryStatsWithCount, monthlyRevenue: [] })
  } catch (error) {
    next(error)
  }
}
