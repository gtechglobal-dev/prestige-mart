const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Order = require('../models/Order')
const Wishlist = require('../models/Wishlist')
const Notification = require('../models/Notification')
const Address = require('../models/Address')

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      email, password: hashedPassword, firstName, lastName, phone, role: 'CUSTOMER'
    })

    const token = generateToken(user)

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    })
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      }
    })
  } catch (error) {
    next(error)
  }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const [addresses, ordersCount, wishlistsCount, notificationsCount] = await Promise.all([
      Address.find({ userId: user._id }).sort({ createdAt: -1 }),
      Order.countDocuments({ userId: user._id }),
      Wishlist.countDocuments({ userId: user._id }),
      Notification.countDocuments({ userId: user._id }),
    ])

    res.json({
      id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      phone: user.phone, avatar: user.avatar, role: user.role, isVerified: user.isVerified,
      createdAt: user.createdAt, addresses,
      _count: { orders: ordersCount, wishlists: wishlistsCount, notifications: notificationsCount }
    })
  } catch (error) {
    next(error)
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body
    const updateData = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (phone) updateData.phone = phone
    if (avatar) updateData.avatar = avatar

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password')
    res.json({ message: 'Profile updated', user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, avatar: user.avatar, role: user.role } })
  } catch (error) {
    next(error)
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.id)
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }
    user.password = await bcrypt.hash(newPassword, 12)
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}
