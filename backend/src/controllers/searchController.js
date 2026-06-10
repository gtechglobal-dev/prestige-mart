const prisma = require('../utils/prisma')

exports.search = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query
    if (!q || q.length < 2) return res.json({ products: [], categories: [] })

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { brand: { contains: q, mode: 'insensitive' } }, { tags: { hasSome: [q] } }], isActive: true },
        take: parseInt(limit),
        select: { id: true, name: true, slug: true, price: true, images: true, stock: true }
      }),
      prisma.category.findMany({
        where: { name: { contains: q, mode: 'insensitive' }, isActive: true },
        take: 5,
        select: { id: true, name: true, slug: true, image: true }
      })
    ])

    res.json({ products, categories })
  } catch (error) {
    next(error)
  }
}
