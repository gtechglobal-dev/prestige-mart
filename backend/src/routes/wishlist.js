const express = require('express')
const router = express.Router()
const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController')
const { authenticate } = require('../middlewares/auth')

router.get('/', authenticate, getWishlist)
router.post('/add', authenticate, addToWishlist)
router.delete('/:productId', authenticate, removeFromWishlist)

module.exports = router
