const Product = require('../models/Product')
const Category = require('../models/Category')
const Review = require('../models/Review')

exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12, featured, rating, brand } = req.query

    const where = { isActive: true }

    if (category) where.categoryId = category
    if (search) where.name = { $regex: search, $options: 'i' }
    if (brand) where.brand = { $regex: brand, $options: 'i' }
    if (featured === 'true') where.isFeatured = true
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.$gte = parseFloat(minPrice)
      if (maxPrice) where.price.$lte = parseFloat(maxPrice)
    }
    if (rating) {
      const ratedProductIds = await Review.distinct('productId', { rating: { $gte: parseInt(rating) } })
      where._id = { $in: ratedProductIds }
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'price_asc') sortOption = { price: 1 }
    if (sort === 'price_desc') sortOption = { price: -1 }
    if (sort === 'name_asc') sortOption = { name: 1 }
    if (sort === 'name_desc') sortOption = { name: -1 }
    if (sort === 'popular') sortOption = { saleCount: -1 }
    if (sort === 'newest') sortOption = { createdAt: -1 }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [products, total] = await Promise.all([
      Product.find(where).sort(sortOption).skip(skip).limit(parseInt(limit))
        .populate('categoryId', 'name slug')
        .lean(),
      Product.countDocuments(where)
    ])

    const productIds = products.map(p => p._id)
    const reviews = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    const reviewMap = {}
    reviews.forEach(r => { reviewMap[r._id.toString()] = { avgRating: Math.round(r.avgRating * 10) / 10, reviewCount: r.count } })

    const productsWithRating = products.map(p => ({
      ...p,
      id: p._id,
      category: p.categoryId,
      categoryId: p.categoryId?._id || p.categoryId,
      avgRating: reviewMap[p._id.toString()]?.avgRating || 0,
      reviewCount: reviewMap[p._id.toString()]?.reviewCount || 0,
    }))

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

    const product = await Product.findOne({ slug })
      .populate('categoryId', 'name slug')
      .lean()

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } })

    const [reviews, relatedRaw, reviewStats] = await Promise.all([
      Review.find({ productId: product._id }).populate('userId', 'firstName lastName avatar').sort({ createdAt: -1 }).lean(),
      Product.find({ categoryId: product.categoryId._id, _id: { $ne: product._id }, isActive: true }).limit(8).populate('categoryId', 'name slug').lean(),
      Review.aggregate([
        { $match: { productId: product._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ])
    ])

    const avgRating = reviewStats.length > 0 ? Math.round(reviewStats[0].avgRating * 10) / 10 : 0

    const relatedIds = relatedRaw.map(p => p._id)
    const relatedReviews = await Review.aggregate([
      { $match: { productId: { $in: relatedIds } } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    const relatedReviewMap = {}
    relatedReviews.forEach(r => { relatedReviewMap[r._id.toString()] = { avgRating: Math.round(r.avgRating * 10) / 10, reviewCount: r.count } })

    const relatedProducts = relatedRaw.map(p => ({
      ...p,
      id: p._id,
      category: p.categoryId,
      categoryId: p.categoryId?._id || p.categoryId,
      avgRating: relatedReviewMap[p._id.toString()]?.avgRating || 0,
      reviewCount: relatedReviewMap[p._id.toString()]?.reviewCount || 0,
    }))

    res.json({
      ...product,
      id: product._id,
      category: product.categoryId,
      categoryId: product.categoryId?._id || product.categoryId,
      avgRating,
      reviewCount: reviewStats.length > 0 ? reviewStats[0].count : 0,
      reviews,
      relatedProducts
    })
  } catch (error) {
    next(error)
  }
}

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true }).limit(12)
      .populate('categoryId', 'name slug').lean()

    const productIds = products.map(p => p._id)
    const reviews = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    const reviewMap = {}
    reviews.forEach(r => { reviewMap[r._id.toString()] = { avgRating: Math.round(r.avgRating * 10) / 10, reviewCount: r.count } })

    res.json(products.map(p => ({
      ...p,
      id: p._id,
      category: p.categoryId,
      categoryId: p.categoryId?._id || p.categoryId,
      avgRating: reviewMap[p._id.toString()]?.avgRating || 0,
      reviewCount: reviewMap[p._id.toString()]?.reviewCount || 0,
    })))
  } catch (error) {
    next(error)
  }
}

exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ saleCount: -1 }).limit(12)
      .populate('categoryId', 'name slug').lean()

    const productIds = products.map(p => p._id)
    const reviews = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    const reviewMap = {}
    reviews.forEach(r => { reviewMap[r._id.toString()] = { avgRating: Math.round(r.avgRating * 10) / 10, reviewCount: r.count } })

    res.json(products.map(p => ({
      ...p,
      id: p._id,
      category: p.categoryId,
      categoryId: p.categoryId?._id || p.categoryId,
      avgRating: reviewMap[p._id.toString()]?.avgRating || 0,
      reviewCount: reviewMap[p._id.toString()]?.reviewCount || 0,
    })))
  } catch (error) {
    next(error)
  }
}
