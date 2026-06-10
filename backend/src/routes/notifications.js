const express = require('express')
const router = express.Router()
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController')
const { authenticate } = require('../middlewares/auth')

router.get('/', authenticate, getNotifications)
router.put('/:id/read', authenticate, markAsRead)
router.put('/read-all', authenticate, markAllAsRead)

module.exports = router
