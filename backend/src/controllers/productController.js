const prisma = require('../utils/prisma')

exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12, featured, rating, brand } = req.query

    const where = { isActive: true }

    if (category) where.categoryId = category
    if (search) where.name = { contains: search, mode: 'insensitive' }
    if (brand) where.brand = { contains: brand, mode: 'insensitive' }
    if (featured === 'true') where.isFeatured = true
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    if (rating) {
      where.reviews = { some: { rating: { gte: parseInt(rating) } } }
    }

    let orderBy = { createdAt: 'desc' }
    if (sort === 'price_asc') orderBy = { price: 'asc' }
    if (sort === 'price_desc') orderBy = { price: 'desc' }
    if (sort === 'name_asc') orderBy = { name: 'asc' }
    if (sort === 'name_desc') orderBy = { name: 'desc' }
    if (sort === 'popular') orderBy = { saleCount: 'desc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          category: { select: { id: true, name: true, slug: true } },
          reviews: { select: { rating: true }, take: 1 },
          _count: { select: { reviews: true } }
        }
      }),
      prisma.product.count({ where })
    ])

    const productsWithRating = products.map(p => {
      const avgRating = p.reviews.length > 0
        ? Math.round(p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length * 10) / 10
        : 0
      const { reviews, ...rest } = p
      return { ...rest, avgRating, reviewCount: p._count.reviews }
    })

    res.json({
      products: productsWithRating,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

exports.getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
        reviews: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { reviews: true, wishlists: true } }
      }
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await prisma.product.update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })

    const avgRating = product.reviews.length > 0
      ? Math.round(product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length * 10) / 10
      : 0

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
      take: 8,
      include: {
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } }
      }
    })

    const relatedProducts = related.map(p => ({
      ...p,
      avgRating: p.reviews.length > 0
        ? Math.round(p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length * 10) / 10
        : 0
    }))

    res.json({ ...product, avgRating, relatedProducts })
  } catch (error) {
    next(error)
  }
}

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 12,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } }
      }
    })

    const productsWithRating = products.map(p => {
      const avgRating = p.reviews.length > 0
        ? Math.round(p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length * 10) / 10
        : 0
      return { ...p, avgRating }
    })

    res.json(productsWithRating)
  } catch (error) {
    next(error)
  }
}

exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { saleCount: 'desc' },
      take: 12,
      include: { reviews: { select: { rating: true } }, _count: { select: { reviews: true } } }
    })

    res.json(products.map(p => ({
      ...p,
      avgRating: p.reviews.length > 0
        ? Math.round(p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length * 10) / 10
        : 0
    })))
  } catch (error) {
    next(error)
  }
}
