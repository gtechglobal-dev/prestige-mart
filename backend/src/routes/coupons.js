const express = require('express')
const router = express.Router()
const { validateCoupon } = require('../controllers/couponController')
const { authenticate } = require('../middlewares/auth')

router.post('/validate', authenticate, validateCoupon)

module.exports = router
