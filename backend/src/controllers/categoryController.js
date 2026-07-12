const Category = require('../models/Category')
const Product = require('../models/Product')

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean()

    const productCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } }
    ])
    const countMap = {}
    productCounts.forEach(c => { countMap[c._id.toString()] = c.count })

    res.json(categories.map(c => ({
      ...c,
      id: c._id,
      _count: { products: countMap[c._id.toString()] || 0 }
    })))
  } catch (error) {
    next(error)
  }
}

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).lean()
    if (!category) return res.status(404).json({ message: 'Category not found' })

    const count = await Product.countDocuments({ categoryId: category._id, isActive: true })
    res.json({ ...category, id: category._id, _count: { products: count } })
  } catch (error) {
    next(error)
  }
}
