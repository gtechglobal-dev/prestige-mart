const prisma = require('../utils/prisma')

exports.getCart = async (req, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, price: true, images: true, stock: true, isActive: true }
            },
            variant: true
          }
        }
      }
    })

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id }, include: { items: true } })
    }

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' })
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.id } })
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId_variantId: { cartId: cart.id, productId, variantId: variantId || '' } }
    })

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      })
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variantId || '', quantity }
      })
    }

    cart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, price: true, images: true, stock: true } },
            variant: true
          }
        }
      }
    })

    res.json({ message: 'Added to cart', cart })
  } catch (error) {
    next(error)
  }
}

exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' })
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, price: true, images: true, stock: true } },
            variant: true
          }
        }
      }
    })

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params
    await prisma.cartItem.delete({ where: { id: itemId } })

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, price: true, images: true, stock: true } },
            variant: true
          }
        }
      }
    })

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } })
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    }
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    next(error)
  }
}
