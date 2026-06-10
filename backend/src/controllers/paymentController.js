const prisma = require('../utils/prisma')
const https = require('https')

exports.initializePaystack = async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await prisma.order.findFirst({ where: { id: orderId, userId: req.user.id } })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.paymentStatus === 'PAID') return res.status(400).json({ message: 'Order already paid' })

    const params = JSON.stringify({ email: req.user.email, amount: Math.round(order.total * 100), reference: `PM-${order.orderNumber}-${Date.now()}`, callback_url: `${process.env.FRONTEND_URL}/orders/${order.id}` })

    const options = { hostname: 'api.paystack.co', port: 443, path: '/transaction/initialize', method: 'POST', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }

    const paystackReq = https.request(options, paystackRes => {
      let data = ''
      paystackRes.on('data', chunk => data += chunk)
      paystackRes.on('end', async () => {
        const response = JSON.parse(data)
        if (response.status) {
          await prisma.order.update({ where: { id: order.id }, data: { paymentRef: response.data.reference, paymentProvider: 'PAYSTACK' } })
          res.json({ authorization_url: response.data.authorization_url, reference: response.data.reference })
        } else {
          res.status(400).json({ message: response.message })
        }
      })
    })
    paystackReq.on('error', error => next(error))
    paystackReq.write(params)
    paystackReq.end()
  } catch (error) {
    next(error)
  }
}

exports.verifyPaystack = async (req, res, next) => {
  try {
    const { reference } = req.params
    const options = { hostname: 'api.paystack.co', port: 443, path: `/transaction/verify/${reference}`, method: 'GET', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }

    const paystackReq = https.request(options, paystackRes => {
      let data = ''
      paystackRes.on('data', chunk => data += chunk)
      paystackRes.on('end', async () => {
        const response = JSON.parse(data)
        if (response.status && response.data.status === 'success') {
          await prisma.order.update({ where: { paymentRef: reference }, data: { paymentStatus: 'PAID', paidAt: new Date(), status: 'CONFIRMED' } })
          await prisma.payment.create({ data: { reference, amount: response.data.amount / 100, status: 'success', provider: 'PAYSTACK', orderId: (await prisma.order.findFirst({ where: { paymentRef: reference } })).id, paidAt: new Date() } })
          res.json({ message: 'Payment verified', status: 'success' })
        } else {
          res.json({ message: 'Payment verification failed', status: 'failed' })
        }
      })
    })
    paystackReq.on('error', error => next(error))
    paystackReq.end()
  } catch (error) {
    next(error)
  }
}

exports.initializeFlutterwave = async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await prisma.order.findFirst({ where: { id: orderId, userId: req.user.id } })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const params = JSON.stringify({
      tx_ref: `PM-${order.orderNumber}-${Date.now()}`,
      amount: order.total,
      currency: 'NGN',
      redirect_url: `${process.env.FRONTEND_URL}/orders/${order.id}`,
      customer: { email: req.user.email, name: `${req.user.firstName} ${req.user.lastName}` },
      meta: { order_id: order.id }
    })

    const options = { hostname: 'api.flutterwave.com', port: 443, path: '/v3/payments', method: 'POST', headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' } }

    const fwReq = https.request(options, fwRes => {
      let data = ''
      fwRes.on('data', chunk => data += chunk)
      fwRes.on('end', async () => {
        const response = JSON.parse(data)
        if (response.status === 'success') {
          await prisma.order.update({ where: { id: order.id }, data: { paymentRef: response.data.tx_ref, paymentProvider: 'FLUTTERWAVE' } })
          res.json({ authorization_url: response.data.link, reference: response.data.tx_ref })
        } else {
          res.status(400).json({ message: response.message })
        }
      })
    })
    fwReq.on('error', error => next(error))
    fwReq.write(params)
    fwReq.end()
  } catch (error) {
    next(error)
  }
}

exports.getTransactions = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { order: { userId: req.user.id } },
      include: { order: { select: { orderNumber: true, total: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(payments)
  } catch (error) {
    next(error)
  }
}
