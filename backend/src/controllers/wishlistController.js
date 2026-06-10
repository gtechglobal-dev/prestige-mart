const prisma = require('../utils/prisma')

exports.getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(items.map(w => ({ ...w.product, wishlistedAt: w.createdAt, avgRating: w.product.reviews.length > 0 ? Math.round(w.product.reviews.reduce((s, r) => s + r.rating, 0) / w.product.reviews.length * 10) / 10 : 0 })))
  } catch (error) {
    next(error)
  }
}

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body
    const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: req.user.id, productId } } })
    if (existing) return res.status(400).json({ message: 'Already in wishlist' })

    await prisma.wishlist.create({ data: { userId: req.user.id, productId } })
    res.status(201).json({ message: 'Added to wishlist' })
  } catch (error) {
    next(error)
  }
}

exports.removeFromWishlist = async (req, res, next) => {
  try {
    await prisma.wishlist.delete({ where: { userId_productId: { userId: req.user.id, productId: req.params.productId } } })
    res.json({ message: 'Removed from wishlist' })
  } catch (error) {
    next(error)
  }
}
