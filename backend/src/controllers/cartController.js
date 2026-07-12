const Cart = require('../models/Cart')
const Product = require('../models/Product')
const ProductVariant = require('../models/ProductVariant')

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name slug price images stock isActive')
      .populate('items.variantId')

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] })
    }

    res.json(cart)
  } catch (error) {
    next(error)
  }
}

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body

    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' })
    }

    let cart = await Cart.findOne({ userId: req.user.id })
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] })
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && (item.variantId?.toString() || '') === (variantId || '')
    )

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({ productId, variantId: variantId || null, quantity })
    }

    await cart.save()

    cart = await Cart.findById(cart._id)
      .populate('items.productId', 'name slug price images stock isActive')
      .populate('items.variantId')

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

    const cart = await Cart.findOne({ userId: req.user.id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    const item = cart.items.id(itemId)
    if (!item) return res.status(404).json({ message: 'Cart item not found' })

    item.quantity = quantity
    await cart.save()

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name slug price images stock isActive')
      .populate('items.variantId')

    res.json(updatedCart)
  } catch (error) {
    next(error)
  }
}

exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params
    const cart = await Cart.findOne({ userId: req.user.id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    cart.items = cart.items.filter(item => item._id.toString() !== itemId)
    await cart.save()

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name slug price images stock isActive')
      .populate('items.variantId')

    res.json(updatedCart)
  } catch (error) {
    next(error)
  }
}

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
    if (cart) {
      cart.items = []
      await cart.save()
    }
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    next(error)
  }
}
