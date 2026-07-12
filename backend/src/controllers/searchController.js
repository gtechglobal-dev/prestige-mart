const Product = require('../models/Product')
const Category = require('../models/Category')

exports.search = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query
    if (!q || q.length < 2) return res.json({ products: [], categories: [] })

    const regex = new RegExp(q, 'i')

    const [products, categories] = await Promise.all([
      Product.find({
        isActive: true,
        $or: [{ name: regex }, { description: regex }, { brand: regex }, { tags: regex }]
      }).limit(parseInt(limit)).select('name slug price images stock').lean(),
      Category.find({ name: regex, isActive: true }).limit(5).select('name slug image').lean()
    ])

    res.json({ products, categories })
  } catch (error) {
    next(error)
  }
}
