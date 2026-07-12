const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Category = require('../models/Category')
const Product = require('../models/Product')
const Coupon = require('../models/Coupon')

const categories = [
  { name: 'Fashion', slug: 'fashion', description: 'Premium African and international fashion wear', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600' },
  { name: 'Shoes', slug: 'shoes', description: 'Luxury footwear for every occasion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
  { name: 'Watches', slug: 'watches', description: 'Exquisite timepieces from world-renowned brands', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600' },
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and electronic devices', image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600' },
  { name: 'Beauty', slug: 'beauty', description: 'Premium beauty and skincare products', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600' },
  { name: 'Accessories', slug: 'accessories', description: 'Complete your look with premium accessories', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600' },
  { name: 'Bags', slug: 'bags', description: 'Designer bags and luggage', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600' },
  { name: 'Perfumes', slug: 'perfumes', description: 'Luxury fragrances for men and women', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600' },
  { name: 'Home & Living', slug: 'home-living', description: 'Premium home decor and lifestyle products', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600' },
  { name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry and precious accessories', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600' },
]

const products = [
  { name: 'Premium Bespoke Agbada', slug: 'premium-bespoke-agbada', description: 'Handcrafted premium agbada with intricate embroidery.', price: 185000, comparePrice: 250000, sku: 'FASH-001', stock: 25, images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600'], brand: 'Prestige Mart', tags: ['agbada', 'native', 'wedding', 'premium'], categoryName: 'Fashion', isFeatured: true, costPrice: 95000, saleCount: 47 },
  { name: 'Designer Kaftan Collection', slug: 'designer-kaftan-collection', description: 'Elegant designer kaftan with modern African prints.', price: 95000, comparePrice: 120000, sku: 'FASH-002', stock: 40, images: ['https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600'], brand: 'Prestige Mart', tags: ['kaftan', 'native', 'african-print'], categoryName: 'Fashion', isFeatured: true, costPrice: 45000, saleCount: 82 },
  { name: 'Luxury Ankara Gown', slug: 'luxury-ankara-gown', description: 'Stunning Ankara gown with modern silhouette.', price: 135000, comparePrice: 180000, sku: 'FASH-003', stock: 18, images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600'], brand: 'African Elegance', tags: ['ankara', 'gown', 'women', 'african'], categoryName: 'Fashion', isFeatured: true, costPrice: 65000, saleCount: 123 },
]

router.get('/', async (req, res) => {
  if (req.query.key !== process.env.SEED_KEY) {
    return res.status(401).json({ message: 'Invalid seed key' })
  }

  try {
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12)

    await User.findOneAndUpdate(
      { email: process.env.ADMIN_EMAIL || 'admin@prestigemart.ng' },
      { $setOnInsert: { email: process.env.ADMIN_EMAIL || 'admin@prestigemart.ng', password: adminPassword, firstName: 'Admin', lastName: 'Prestige', role: 'ADMIN', phone: '+2348000000000', isVerified: true } },
      { upsert: true, new: true }
    )

    for (const cat of categories) {
      await Category.findOneAndUpdate({ slug: cat.slug }, { $setOnInsert: cat }, { upsert: true, new: true })
    }
    const dbCategories = await Category.find()

    let productCount = 0
    for (const prod of products) {
      const category = dbCategories.find(c => c.name === prod.categoryName)
      if (!category) continue
      const { categoryName, ...productData } = prod
      await Product.findOneAndUpdate({ sku: prod.sku }, { $setOnInsert: { ...productData, categoryId: category._id } }, { upsert: true, new: true })
      productCount++
    }

    const couponData = [
      { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 50000, maxUses: 100, isActive: true },
      { code: 'PREMIUM50', type: 'flat', value: 50000, minOrder: 200000, maxUses: 50, isActive: true },
      { code: 'FREESHIP', type: 'flat', value: 2500, minOrder: 50000, maxUses: 200, isActive: true },
    ]
    for (const coupon of couponData) {
      await Coupon.findOneAndUpdate({ code: coupon.code }, { $setOnInsert: coupon }, { upsert: true, new: true })
    }

    res.json({
      message: 'Database seeded successfully',
      admin: { email: process.env.ADMIN_EMAIL || 'admin@prestigemart.ng', password: process.env.ADMIN_PASSWORD || 'Admin@123456' },
      productsCreated: productCount,
      categoriesCreated: categories.length,
      couponsCreated: couponData.length,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
