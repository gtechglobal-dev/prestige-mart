const Wishlist = require('../models/Wishlist')
const Review = require('../models/Review')

exports.getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ userId: req.user.id })
      .populate({
        path: 'productId',
        populate: { path: 'categoryId', select: 'name slug' }
      })
      .sort({ createdAt: -1 })

    const productIds = items.filter(i => i.productId).map(i => i.productId._id)
    const reviews = await Review.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ])
    const reviewMap = {}
    reviews.forEach(r => { reviewMap[r._id.toString()] = { avgRating: Math.round(r.avgRating * 10) / 10, reviewCount: r.count } })

    res.json(items.filter(i => i.productId).map(w => ({
      ...w.productId.toObject(),
      id: w.productId._id,
      category: w.productId.categoryId,
      wishlistedAt: w.createdAt,
      avgRating: reviewMap[w.productId._id.toString()]?.avgRating || 0,
      reviewCount: reviewMap[w.productId._id.toString()]?.reviewCount || 0,
    })))
  } catch (error) {
    next(error)
  }
}

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body
    const existing = await Wishlist.findOne({ userId: req.user.id, productId })
    if (existing) return res.status(400).json({ message: 'Already in wishlist' })

    await Wishlist.create({ userId: req.user.id, productId })
    res.status(201).json({ message: 'Added to wishlist' })
  } catch (error) {
    next(error)
  }
}

exports.removeFromWishlist = async (req, res, next) => {
  try {
    await Wishlist.findOneAndDelete({ userId: req.user.id, productId: req.params.productId })
    res.json({ message: 'Removed from wishlist' })
  } catch (error) {
    next(error)
  }
}
