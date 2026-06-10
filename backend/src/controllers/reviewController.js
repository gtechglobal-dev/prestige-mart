const prisma = require('../utils/prisma')

exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const existing = await prisma.review.findUnique({ where: { productId_userId: { productId, userId: req.user.id } } })
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' })

    const review = await prisma.review.create({
      data: { productId, userId: req.user.id, rating, title, comment },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
    })

    res.status(201).json({ message: 'Review submitted', review })
  } catch (error) {
    next(error)
  }
}

exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(reviews)
  } catch (error) {
    next(error)
  }
}
