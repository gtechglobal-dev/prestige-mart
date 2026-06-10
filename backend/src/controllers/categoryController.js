const prisma = require('../utils/prisma')

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    })
    res.json(categories)
  } catch (error) {
    next(error)
  }
}

exports.getCategory = async (req, res, next) => {
  try {
    const { slug } = req.params
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { _count: { select: { products: true } } }
    })
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json(category)
  } catch (error) {
    next(error)
  }
}
