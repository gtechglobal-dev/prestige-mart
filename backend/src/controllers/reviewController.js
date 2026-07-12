const Review = require('../models/Review')
const Product = require('../models/Product')

exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body

    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const existing = await Review.findOne({ productId, userId: req.user.id })
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' })

    const review = await Review.create({ productId, userId: req.user.id, rating, title, comment })
    const populated = await Review.findById(review._id).populate('userId', 'firstName lastName avatar')

    res.status(201).json({ message: 'Review submitted', review: populated })
  } catch (error) {
    next(error)
  }
}

exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (error) {
    next(error)
  }
}
