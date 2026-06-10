const express = require('express')
const router = express.Router()
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController')
const { authenticate } = require('../middlewares/auth')

router.get('/', authenticate, getCart)
router.post('/add', authenticate, addToCart)
router.put('/item/:itemId', authenticate, updateCartItem)
router.delete('/item/:itemId', authenticate, removeFromCart)
router.delete('/clear', authenticate, clearCart)

module.exports = router
