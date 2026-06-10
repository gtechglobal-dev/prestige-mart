const prisma = require('../utils/prisma')

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    res.json(notifications)
  } catch (error) {
    next(error)
  }
}

exports.markAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, id: { in: req.body.ids || [req.params.id] } },
      data: { isRead: true }
    })
    res.json({ message: 'Notifications marked as read' })
  } catch (error) {
    next(error)
  }
}

exports.markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } })
    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    next(error)
  }
}
