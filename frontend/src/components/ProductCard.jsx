import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatPrice, getStars } from '../utils/helpers'

export default function ProductCard({ product, index = 0 }) {
  const stars = getStars(product.avgRating || 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-pm-light dark:bg-pm-primary/50">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="absolute top-3 left-3 bg-pm-secondary text-pm-primary text-xs font-bold px-2 py-1 rounded-lg">
              -{Math.round((1 - product.price / product.comparePrice) * 100)}%
            </span>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-pm-primary px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          )}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="h-9 w-9 rounded-full bg-white/90 dark:bg-pm-dark/90 flex items-center justify-center shadow-lg hover:bg-pm-secondary hover:text-white transition">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs text-pm-gray uppercase tracking-wider truncate">{product.brand || product.category?.name}</p>
          <h3 className="font-medium text-sm truncate">{product.name}</h3>
          <div className="flex items-center gap-1">
            {stars.map((s, i) => (
              <svg key={i} className={`h-3.5 w-3.5 ${s === 'full' ? 'text-pm-secondary' : s === 'half' ? 'text-pm-secondary' : 'text-pm-border'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-pm-gray ml-1">({product.reviewCount || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-pm-secondary">{formatPrice(product.price)}</span>
            {product.comparePrice > product.price && (
              <span className="text-xs text-pm-gray line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
