const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/auth')
const { adminOnly } = require('../middlewares/admin')
const {
  getDashboard, getOrders, updateOrderStatus,
  getCustomers, getCustomer,
  createProduct, updateProduct, deleteProduct,
  createCoupon, getCoupons, getAnalytics
} = require('../controllers/adminController')

router.use(authenticate, adminOnly)

router.get('/dashboard', getDashboard)
router.get('/orders', getOrders)
router.put('/orders/:id/status', updateOrderStatus)
router.get('/customers', getCustomers)
router.get('/customers/:id', getCustomer)
router.post('/products', createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)
router.post('/coupons', createCoupon)
router.get('/coupons', getCoupons)
router.get('/analytics', getAnalytics)

module.exports = router
