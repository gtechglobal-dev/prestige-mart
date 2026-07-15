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
  { name: 'Premium Dashiki Shirt', slug: 'premium-dashiki-shirt', description: 'Modern take on the classic Dashiki.', price: 45000, comparePrice: 55000, sku: 'FASH-004', stock: 60, images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600'], brand: 'Prestige Mart', tags: ['dashiki', 'shirt', 'men', 'casual'], categoryName: 'Fashion', isFeatured: false, costPrice: 22000, saleCount: 205 },
  { name: 'Executive Suit Collection', slug: 'executive-suit-collection', description: 'Tailored executive suit for the modern professional.', price: 350000, comparePrice: 450000, sku: 'FASH-005', stock: 12, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'], brand: 'Prestige Mart', tags: ['suit', 'executive', 'formal', 'men'], categoryName: 'Fashion', isFeatured: true, costPrice: 180000, saleCount: 36 },
  { name: 'Classic Leather Loafers', slug: 'classic-leather-loafers', description: 'Handcrafted Italian leather loafers.', price: 185000, comparePrice: 250000, sku: 'SHOES-001', stock: 20, images: ['https://images.unsplash.com/photo-1614252369475-531192835a7a?w=600'], brand: 'Prestige Mart', tags: ['loafers', 'leather', 'formal', 'men'], categoryName: 'Shoes', isFeatured: true, costPrice: 95000, saleCount: 74 },
  { name: 'Premium Sneakers Limited', slug: 'premium-sneakers-limited', description: 'Limited edition premium sneakers.', price: 165000, comparePrice: 220000, sku: 'SHOES-002', stock: 30, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], brand: 'SneakLab', tags: ['sneakers', 'limited', 'casual', 'men'], categoryName: 'Shoes', isFeatured: true, costPrice: 85000, saleCount: 156 },
  { name: 'Rolex Submariner Date', slug: 'rolex-submariner-date', description: 'Authentic Rolex Submariner Date.', price: 8500000, comparePrice: 9500000, sku: 'WATCH-001', stock: 2, images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600'], brand: 'Rolex', tags: ['rolex', 'submariner', 'luxury', 'swiss'], categoryName: 'Watches', isFeatured: true, costPrice: 5500000, saleCount: 5 },
  { name: 'Omega Speedmaster Professional', slug: 'omega-speedmaster-professional', description: 'The legendary Moonwatch.', price: 3200000, comparePrice: 3800000, sku: 'WATCH-002', stock: 3, images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600'], brand: 'Omega', tags: ['omega', 'speedmaster', 'luxury', 'swiss'], categoryName: 'Watches', isFeatured: true, costPrice: 2100000, saleCount: 8 },
  { name: 'Audemars Piguet Royal Oak', slug: 'audemars-piguet-royal-oak', description: 'Exquisite Royal Oak in stainless steel.', price: 12500000, comparePrice: 14500000, sku: 'WATCH-005', stock: 1, images: ['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600'], brand: 'Audemars Piguet', tags: ['audemars-piguet', 'royal-oak', 'luxury', 'swiss'], categoryName: 'Watches', isFeatured: true, costPrice: 8500000, saleCount: 2 },
  { name: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max', description: 'Latest iPhone with A18 Pro chip.', price: 1850000, comparePrice: 2100000, sku: 'ELEC-001', stock: 15, images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'], brand: 'Apple', tags: ['iphone', 'apple', 'smartphone', 'premium'], categoryName: 'Electronics', isFeatured: true, costPrice: 1200000, saleCount: 89 },
  { name: 'MacBook Pro 16" M4', slug: 'macbook-pro-16-m4', description: 'Powerful MacBook Pro with M4 chip.', price: 4500000, comparePrice: 5200000, sku: 'ELEC-002', stock: 8, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'], brand: 'Apple', tags: ['macbook', 'apple', 'laptop', 'pro'], categoryName: 'Electronics', isFeatured: true, costPrice: 3200000, saleCount: 34 },
  { name: 'Sony WH-1000XM6 Headphones', slug: 'sony-wh-1000xm6-headphones', description: 'Industry-leading noise cancellation.', price: 450000, comparePrice: 550000, sku: 'ELEC-004', stock: 25, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'], brand: 'Sony', tags: ['sony', 'headphones', 'noise-cancelling', 'audio'], categoryName: 'Electronics', isFeatured: true, costPrice: 280000, saleCount: 112 },
  { name: 'Dyson Airwrap Complete', slug: 'dyson-airwrap-complete', description: 'Multi-styler complete set for hair.', price: 650000, comparePrice: 780000, sku: 'BEAU-001', stock: 14, images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'], brand: 'Dyson', tags: ['dyson', 'hair', 'styler', 'beauty'], categoryName: 'Beauty', isFeatured: true, costPrice: 400000, saleCount: 67 },
  { name: 'Designer Sunglasses', slug: 'designer-sunglasses', description: 'Premium UV-protected designer sunglasses.', price: 185000, comparePrice: 250000, sku: 'ACC-001', stock: 25, images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'], brand: 'Italian Eyes', tags: ['sunglasses', 'designer', 'uv-protection', 'gold'], categoryName: 'Accessories', isFeatured: true, costPrice: 92000, saleCount: 78 },
  { name: 'Designer Leather Backpack', slug: 'designer-leather-backpack', description: 'Premium full-grain leather backpack.', price: 280000, comparePrice: 350000, sku: 'BAGS-001', stock: 15, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], brand: 'Prestige Mart', tags: ['backpack', 'leather', 'laptop', 'designer'], categoryName: 'Bags', isFeatured: true, costPrice: 150000, saleCount: 45 },
  { name: 'Louis Vuitton Neverfull GM', slug: 'louis-vuitton-neverfull-gm', description: 'Authentic Louis Vuitton Neverfull GM.', price: 950000, comparePrice: 1200000, sku: 'BAGS-002', stock: 3, images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600'], brand: 'Louis Vuitton', tags: ['louis-vuitton', 'neverfull', 'designer', 'luxury'], categoryName: 'Bags', isFeatured: true, costPrice: 650000, saleCount: 12 },
  { name: 'Gucci GG Marmont Bag', slug: 'gucci-gg-marmont-bag', description: 'Authentic Gucci GG Marmont shoulder bag.', price: 1200000, comparePrice: 1500000, sku: 'BAGS-003', stock: 2, images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600'], brand: 'Gucci', tags: ['gucci', 'marmont', 'designer', 'luxury'], categoryName: 'Bags', isFeatured: true, costPrice: 800000, saleCount: 8 },
  { name: 'Creed Aventus EDP', slug: 'creed-aventus-edp', description: 'The iconic Creed Aventus.', price: 350000, comparePrice: 420000, sku: 'PERF-001', stock: 12, images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'], brand: 'Creed', tags: ['creed', 'aventus', 'niche', 'masculine'], categoryName: 'Perfumes', isFeatured: true, costPrice: 220000, saleCount: 56 },
  { name: 'Tom Ford Oud Wood', slug: 'tom-ford-oud-wood', description: 'Exotic and sensual Oud Wood by Tom Ford.', price: 420000, comparePrice: 520000, sku: 'PERF-003', stock: 10, images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'], brand: 'Tom Ford', tags: ['tom-ford', 'oud', 'niche', 'unisex'], categoryName: 'Perfumes', isFeatured: true, costPrice: 260000, saleCount: 38 },
  { name: 'Gold Diamond Necklace', slug: 'gold-diamond-necklace', description: '18k gold diamond-cut necklace.', price: 2500000, comparePrice: 3200000, sku: 'JEWL-001', stock: 2, images: ['https://images.unsplash.com/photo-1602751584552-8ba73a1d1d4a?w=600'], brand: 'Prestige Gems', tags: ['necklace', 'gold', 'diamond', 'luxury'], categoryName: 'Jewelry', isFeatured: true, costPrice: 1600000, saleCount: 6 },
  { name: 'Diamond Engagement Ring', slug: 'diamond-engagement-ring', description: 'Stunning 2 carat round brilliant diamond ring.', price: 5800000, comparePrice: 7200000, sku: 'JEWL-004', stock: 1, images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600'], brand: 'Prestige Gems', tags: ['ring', 'diamond', 'engagement', 'platinum'], categoryName: 'Jewelry', isFeatured: true, costPrice: 3800000, saleCount: 3 },
  { name: 'African Art Wall Decor', slug: 'african-art-wall-decor', description: 'Handcrafted African art piece.', price: 185000, comparePrice: 250000, sku: 'HOME-003', stock: 10, images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600'], brand: 'Artisans NG', tags: ['art', 'african', 'decor', 'handmade'], categoryName: 'Home & Living', isFeatured: true, costPrice: 85000, saleCount: 23 },
  { name: 'Premium Skincare Set', slug: 'premium-skincare-set', description: 'Complete skincare routine set.', price: 185000, comparePrice: 250000, sku: 'BEAU-002', stock: 30, images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=600'], brand: 'Glow Lab', tags: ['skincare', 'beauty', 'premium', 'set'], categoryName: 'Beauty', isFeatured: false, costPrice: 95000, saleCount: 134 },
  { name: 'Nigerian Shea Butter Collection', slug: 'nigerian-shea-butter-collection', description: 'Pure, unrefined Nigerian shea butter.', price: 25000, comparePrice: 35000, sku: 'BEAU-003', stock: 100, images: ['https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600'], brand: 'Prestige Mart', tags: ['shea-butter', 'natural', 'organic', 'nigeria'], categoryName: 'Beauty', isFeatured: false, costPrice: 12000, saleCount: 345 },
  { name: 'Premium Leather Belt', slug: 'premium-leather-belt', description: 'Italian full-grain leather belt.', price: 85000, comparePrice: 110000, sku: 'ACC-002', stock: 40, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'], brand: 'Prestige Mart', tags: ['belt', 'leather', 'italian', 'accessory'], categoryName: 'Accessories', isFeatured: false, costPrice: 42000, saleCount: 145 },
  { name: 'Premium Face Cap Collection', slug: 'premium-face-cap-collection', description: 'Stylish premium caps.', price: 25000, comparePrice: 35000, sku: 'ACC-004', stock: 60, images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600'], brand: 'Street Style NG', tags: ['cap', 'hat', 'accessory', 'casual'], categoryName: 'Accessories', isFeatured: false, costPrice: 12000, saleCount: 234 },
  { name: 'Gold Cufflinks Set', slug: 'gold-cufflinks-set', description: '18k gold-plated cufflinks set.', price: 125000, comparePrice: 160000, sku: 'ACC-005', stock: 15, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'], brand: 'Gold Standard', tags: ['cufflinks', 'gold', 'formal', 'gift'], categoryName: 'Accessories', isFeatured: true, costPrice: 65000, saleCount: 32 },
  { name: 'Chanel Classic Flap Bag', slug: 'chanel-classic-flap-bag', description: 'Iconic Chanel Classic Flap Bag.', price: 2800000, comparePrice: 3500000, sku: 'BAGS-005', stock: 1, images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600'], brand: 'Chanel', tags: ['chanel', 'classic-flap', 'designer', 'luxury'], categoryName: 'Bags', isFeatured: true, costPrice: 1900000, saleCount: 4 },
  { name: 'Luxury Makeup Set', slug: 'luxury-makeup-set', description: 'Complete makeup collection.', price: 280000, comparePrice: 350000, sku: 'BEAU-004', stock: 18, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600'], brand: 'Glamour House', tags: ['makeup', 'cosmetics', 'luxury', 'set'], categoryName: 'Beauty', isFeatured: true, costPrice: 150000, saleCount: 42 },
  { name: 'Chanel No. 5 EDP', slug: 'chanel-no-5-edp', description: "The world's most famous fragrance.", price: 280000, comparePrice: 350000, sku: 'PERF-002', stock: 15, images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'], brand: 'Chanel', tags: ['chanel', 'no-5', 'feminine', 'classic'], categoryName: 'Perfumes', isFeatured: false, costPrice: 170000, saleCount: 43 },
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