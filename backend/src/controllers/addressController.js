const prisma = require('../utils/prisma')

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } })
    res.json(addresses)
  } catch (error) {
    next(error)
  }
}

exports.createAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, country, zip, isDefault } = req.body
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id, isDefault: true }, data: { isDefault: false } })
    }
    const address = await prisma.address.create({ data: { userId: req.user.id, label, street, city, state, country: country || 'Nigeria', zip, isDefault: isDefault || false } })
    res.status(201).json({ message: 'Address created', address })
  } catch (error) {
    next(error)
  }
}

exports.updateAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, country, zip, isDefault } = req.body
    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id, isDefault: true, id: { not: req.params.id } }, data: { isDefault: false } })
    }
    const address = await prisma.address.update({ where: { id: req.params.id }, data: { label, street, city, state, country, zip, isDefault } })
    res.json({ message: 'Address updated', address })
  } catch (error) {
    next(error)
  }
}

exports.deleteAddress = async (req, res, next) => {
  try {
    await prisma.address.delete({ where: { id: req.params.id } })
    res.json({ message: 'Address deleted' })
  } catch (error) {
    next(error)
  }
}
