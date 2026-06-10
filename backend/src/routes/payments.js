const express = require('express')
const router = express.Router()
const { initializePaystack, verifyPaystack, initializeFlutterwave, getTransactions } = require('../controllers/paymentController')
const { authenticate } = require('../middlewares/auth')

router.post('/paystack/initialize', authenticate, initializePaystack)
router.get('/paystack/verify/:reference', authenticate, verifyPaystack)
router.post('/flutterwave/initialize', authenticate, initializeFlutterwave)
router.get('/transactions', authenticate, getTransactions)

module.exports = router
