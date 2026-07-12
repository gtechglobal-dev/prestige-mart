const Address = require('../models/Address')

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json(addresses)
  } catch (error) {
    next(error)
  }
}

exports.createAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, country, zip, isDefault } = req.body
    if (isDefault) {
      await Address.updateMany({ userId: req.user.id, isDefault: true }, { isDefault: false })
    }
    const address = await Address.create({ userId: req.user.id, label, street, city, state, country: country || 'Nigeria', zip, isDefault: isDefault || false })
    res.status(201).json({ message: 'Address created', address })
  } catch (error) {
    next(error)
  }
}

exports.updateAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, country, zip, isDefault } = req.body
    if (isDefault) {
      await Address.updateMany({ userId: req.user.id, isDefault: true, _id: { $ne: req.params.id } }, { isDefault: false })
    }
    const address = await Address.findByIdAndUpdate(req.params.id, { label, street, city, state, country, zip, isDefault }, { new: true })
    res.json({ message: 'Address updated', address })
  } catch (error) {
    next(error)
  }
}

exports.deleteAddress = async (req, res, next) => {
  try {
    await Address.findByIdAndDelete(req.params.id)
    res.json({ message: 'Address deleted' })
  } catch (error) {
    next(error)
  }
}
