const express = require('express')
const router = express.Router()
const { createOrder, getOrders, getOrder, cancelOrder } = require('../controllers/orderController')
const { authenticate } = require('../middlewares/auth')

router.post('/', authenticate, createOrder)
router.get('/', authenticate, getOrders)
router.get('/:id', authenticate, getOrder)
router.put('/:id/cancel', authenticate, cancelOrder)

module.exports = router
