const Notification = require('../models/Notification')

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50)
    res.json(notifications)
  } catch (error) {
    next(error)
  }
}

exports.markAsRead = async (req, res, next) => {
  try {
    const ids = req.body.ids || [req.params.id]
    await Notification.updateMany({ userId: req.user.id, _id: { $in: ids } }, { isRead: true })
    res.json({ message: 'Notifications marked as read' })
  } catch (error) {
    next(error)
  }
}

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
}
