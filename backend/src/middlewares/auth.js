const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('email firstName lastName role avatar phone')

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' })
    }

    req.user = { id: user._id.toString(), email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, avatar: user.avatar, phone: user.phone }
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token.' })
    }
    next(error)
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('email firstName lastName role')

    if (user) req.user = { id: user._id.toString(), email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    next()
  } catch {
    next()
  }
}

module.exports = { authenticate, optionalAuth }
