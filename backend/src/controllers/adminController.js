const prisma = require('../utils/prisma')
const { generateOrderNumber } = require('../utils/generateOrderNumber')
const bcrypt = require('bcryptjs')

exports.getDashboard = async (req, res, next) => {
  try {
    const [totalRevenue, ordersCount, customersCount, productsCount, recentOrders, revenueData] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, email: true } }, items: true } }),
      prisma.order.groupBy({ by: ['createdAt'], _sum: { total: true }, where: { paymentStatus: 'PAID' }, orderBy: { createdAt: 'desc' }, take: 30 })
    ])

    res.json({
      totalRevenue: totalRevenue._sum.total || 0,
      ordersCount,
      customersCount,
      productsCount,
      recentOrders,
      revenueData: revenueData.reverse()
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
      prisma.order.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } }, items: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.order.count({ where })
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

    const order = await prisma.order.update({ where: { id: req.params.id }, data: updateData, include: { items: true, user: true } })

    if (status === 'CANCELLED') {
      for (const item of order.items) {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
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
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } })
    ])
    res.json({ customers, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } })
  } catch (error) {
    next(error)
  }
}

exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'CUSTOMER' },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatar: true, createdAt: true, orders: { include: { items: true }, orderBy: { createdAt: 'desc' }, take: 20 } }
    })
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    res.json(customer)
  } catch (error) {
    next(error)
  }
}

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, comparePrice, costPrice, sku, stock, images, categoryId, brand, tags, isFeatured, variants } = req.body
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const product = await prisma.product.create({
      data: {
        name, slug: slug + '-' + Date.now().toString(36),
        description, price: parseFloat(price), comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null, sku, stock: parseInt(stock) || 0,
        images: images || [], categoryId, brand, tags: tags || [], isFeatured: isFeatured || false,
        variants: variants ? { create: variants.map(v => ({ ...v, price: v.price ? parseFloat(v.price) : null, stock: parseInt(v.stock) || 0 })) } : undefined
      },
      include: { variants: true, category: true }
    })
    res.status(201).json({ message: 'Product created', product })
  } catch (error) {
    next(error)
  }
}

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, comparePrice, costPrice, sku, stock, images, categoryId, brand, tags, isFeatured } = req.body
    const data = {}
    if (name) { data.name = name; data.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36) }
    if (description !== undefined) data.description = description
    if (price) data.price = parseFloat(price)
    if (comparePrice !== undefined) data.comparePrice = comparePrice ? parseFloat(comparePrice) : null
    if (costPrice !== undefined) data.costPrice = costPrice ? parseFloat(costPrice) : null
    if (sku) data.sku = sku
    if (stock !== undefined) data.stock = parseInt(stock)
    if (images) data.images = images
    if (categoryId) data.categoryId = categoryId
    if (brand !== undefined) data.brand = brand
    if (tags) data.tags = tags
    if (isFeatured !== undefined) data.isFeatured = isFeatured

    const product = await prisma.product.update({ where: { id: req.params.id }, data, include: { variants: true, category: true } })
    res.json({ message: 'Product updated', product })
  } catch (error) {
    next(error)
  }
}

exports.deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ message: 'Product deleted' })
  } catch (error) {
    next(error)
  }
}

exports.createCoupon = async (req, res, next) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt } = req.body
    const coupon = await prisma.coupon.create({ data: { code: code.toUpperCase(), type, value: parseFloat(value), minOrder: parseFloat(minOrder || 0), maxUses: parseInt(maxUses || 100), expiresAt: expiresAt ? new Date(expiresAt) : null } })
    res.status(201).json({ message: 'Coupon created', coupon })
  } catch (error) {
    next(error)
  }
}

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
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

    const [thisMonthRevenue, lastMonthRevenue, topProducts, categoryStats, monthlyRevenue] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: thisMonth } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID', createdAt: { gte: lastMonth, lt: thisMonth } } }),
      prisma.product.findMany({ orderBy: { saleCount: 'desc' }, take: 10, select: { id: true, name: true, saleCount: true, price: true, images: true, stock: true } }),
      prisma.category.findMany({ select: { id: true, name: true, _count: { select: { products: true } } } }),
      prisma.$queryRaw`SELECT DATE_TRUNC('month', "createdAt") as month, SUM("total") as revenue FROM "Order" WHERE "paymentStatus" = 'PAID' AND "createdAt" > NOW() - INTERVAL '12 months' GROUP BY month ORDER BY month`
    ])

    res.json({
      thisMonthRevenue: thisMonthRevenue._sum.total || 0,
      lastMonthRevenue: lastMonthRevenue._sum.total || 0,
      topProducts,
      categoryStats,
      monthlyRevenue
    })
  } catch (error) {
    next(error)
  }
}
