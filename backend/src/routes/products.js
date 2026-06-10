const express = require('express')
const router = express.Router()
const { getProducts, getProduct, getFeaturedProducts, getBestSellers } = require('../controllers/productController')

router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/best-sellers', getBestSellers)
router.get('/:slug', getProduct)

module.exports = router
