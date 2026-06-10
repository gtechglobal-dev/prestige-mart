import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { productAPI, wishlistAPI, reviewAPI } from '../api'
import { formatPrice, formatDate, getStars } from '../utils/helpers'
import SEO from '../components/SEO'
import ProductCard from '../components/ProductCard'
import { Loader } from '../components/Loader'

export default function ProductDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.getBySlug(slug),
  })

  const reviewMutation = useMutation({
    mutationFn: (data) => reviewAPI.create(data),
    onSuccess: () => {
      setReviewForm({ rating: 5, title: '', comment: '' })
    }
  })

  const handleAddToCart = async () => {
    if (!user) return window.location.href = '/login'
    await addToCart(product.id, selectedVariant, quantity)
  }

  const handleToggleWishlist = async () => {
    if (!user) return window.location.href = '/login'
    try { await wishlistAPI.add(product.id) } catch { }
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    reviewMutation.mutate({ ...reviewForm, productId: product.id })
  }

  if (isLoading) return <Loader className="min-h-[60vh]" />
  if (!product) return <div className="text-center py-20">Product not found</div>

  const stars = getStars(product.avgRating || 0)
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600']

  return (
    <>
      <SEO title={product.name} description={product.description} image={images[0]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm text-pm-gray mb-8">
          <Link to="/" className="hover:text-pm-secondary">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-pm-secondary">Shop</Link>
          <span>/</span>
          {product.category && <Link to={`/shop?category=${product.category.slug}`} className="hover:text-pm-secondary">{product.category.name}</Link>}
          <span>/</span>
          <span className="text-pm-primary dark:text-white truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-pm-light dark:bg-pm-primary/50">
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition ${i === selectedImage ? 'border-pm-secondary' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-pm-secondary uppercase tracking-wider">{product.brand || product.category?.name}</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading mt-2">{product.name}</h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-0.5">
                {stars.map((s, i) => (
                  <svg key={i} className={`h-5 w-5 ${s === 'full' ? 'text-pm-secondary' : s === 'half' ? 'text-pm-secondary' : 'text-pm-border'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-pm-gray">({product._count?.reviews || 0} reviews)</span>
            </div>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="text-3xl font-bold text-pm-secondary">{formatPrice(product.price)}</span>
              {product.comparePrice > product.price && (
                <span className="text-lg text-pm-gray line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </div>

            <p className="mt-6 text-pm-gray leading-relaxed">{product.description}</p>

            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${product.stock > 0 ? 'bg-pm-success' : 'bg-red-500'}`} />
              <span className="text-sm text-pm-gray">{product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}</span>
            </div>

            {product.variants?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button key={v.id} onClick={() => { setSelectedVariant(v.id); setQuantity(1) }} className={`px-4 py-2 rounded-lg border text-sm transition ${selectedVariant === v.id ? 'border-pm-secondary bg-pm-secondary/10 text-pm-secondary' : 'border-pm-border dark:border-white/10 hover:border-pm-secondary'}`}>
                      {v.name} {v.price && <span className="text-pm-secondary ml-1">(+{formatPrice(v.price - product.price)})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-pm-border dark:border-white/10 rounded-xl">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-12 w-12 flex items-center justify-center hover:bg-pm-light dark:hover:bg-pm-primary/30 transition">-</button>
                <span className="h-12 w-16 flex items-center justify-center font-medium border-x border-pm-border dark:border-white/10">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="h-12 w-12 flex items-center justify-center hover:bg-pm-light dark:hover:bg-pm-primary/30 transition">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock <= 0} className="flex-1 bg-pm-primary dark:bg-pm-secondary text-white dark:text-pm-primary h-12 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50">
                Add to Cart
              </button>
              <button onClick={handleToggleWishlist} className="h-12 w-12 border border-pm-border dark:border-white/10 rounded-xl flex items-center justify-center hover:border-pm-secondary transition">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 p-4 rounded-2xl bg-pm-light dark:bg-pm-primary/30">
              {[{ icon: '🚚', text: 'Free delivery over ₦50k' }, { icon: '🔄', text: '7-day returns' }, { icon: '✅', text: 'Authentic guaranteed' }].map((item, i) => (
                <div key={i} className="text-center">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-xs text-pm-gray mt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold font-heading mb-8">Customer Reviews</h2>

          {user && (
            <form onSubmit={handleSubmitReview} className="mb-10 p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: r }))}>
                    <svg className={`h-8 w-8 ${r <= reviewForm.rating ? 'text-pm-secondary' : 'text-pm-border'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-pm-secondary" />
              <textarea placeholder="Write your review..." value={reviewForm.comment} onChange={(e) => setReviewForm(f => ({ ...f, comment: e.target.value }))} rows={3} className="w-full bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-pm-secondary resize-none" />
              <button type="submit" disabled={reviewMutation.isPending} className="bg-pm-secondary text-pm-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-pm-secondary-light transition disabled:opacity-50">
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          <div className="space-y-4">
            {product.reviews?.length === 0 ? (
              <p className="text-pm-gray text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              product.reviews?.map(review => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-pm-secondary/20 flex items-center justify-center text-pm-secondary font-semibold">
                        {(review.user?.firstName || 'U')[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.user?.firstName} {review.user?.lastName}</p>
                        <p className="text-xs text-pm-gray">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-pm-secondary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </div>
                  </div>
                  {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                  <p className="text-sm text-pm-gray leading-relaxed">{review.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {product.relatedProducts?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-heading mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {product.relatedProducts.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
