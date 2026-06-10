const express = require('express')
const router = express.Router()
const { getAddresses, createAddress, updateAddress, deleteAddress } = require('../controllers/addressController')
const { authenticate } = require('../middlewares/auth')

router.get('/addresses', authenticate, getAddresses)
router.post('/addresses', authenticate, createAddress)
router.put('/addresses/:id', authenticate, updateAddress)
router.delete('/addresses/:id', authenticate, deleteAddress)

module.exports = router
