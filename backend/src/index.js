require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/orders')
const wishlistRoutes = require('./routes/wishlist')
const reviewRoutes = require('./routes/reviews')
const couponRoutes = require('./routes/coupons')
const userRoutes = require('./routes/users')
const adminRoutes = require('./routes/admin')
const paymentRoutes = require('./routes/payments')
const notificationRoutes = require('./routes/notifications')
const searchRoutes = require('./routes/search')
const seedRoutes = require('./routes/seed')

const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/api', limiter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Prestige Mart API', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/seed', seedRoutes)

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

if (!process.env.VERCEL && !process.env.NETLIFY) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Prestige Mart API running on port ${PORT}`)
  })
}

module.exports = app
