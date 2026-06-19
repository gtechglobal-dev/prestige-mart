import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { couponAPI } from '../api'
import { formatPrice } from '../utils/helpers'
import SEO from '../components/SEO'
import { Loader } from '../components/Loader'

export default function Cart() {
  const { user } = useAuth()
  const { cart, loading, updateItem, removeItem, clearCart } = useCart()
  const navigate = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <SEO title="Cart" />
        <h1 className="text-3xl font-bold font-heading mb-4">Your Cart</h1>
        <p className="text-pm-gray mb-6">Please sign in to view your cart.</p>
        <Link to="/login" className="bg-pm-secondary text-pm-primary px-8 py-3 rounded-xl font-semibold inline-block">Sign In</Link>
      </div>
    )
  }

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.variant?.price || item.product.price) * item.quantity, 0) || 0
  const discount = coupon ? (coupon.type === 'percentage' ? subtotal * coupon.value / 100 : Math.min(coupon.value, subtotal)) : 0
  const shipping = subtotal >= 50000 ? 0 : 2500
  const total = subtotal - discount + shipping

  const handleApplyCoupon = async () => {
    if (!couponCode) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await couponAPI.validate({ code: couponCode, subtotal })
      if (res.valid) { setCoupon(res.coupon) } else { setCouponError('Invalid coupon') }
    } catch (err) { setCouponError(err.response?.data?.message || 'Invalid coupon') }
    setCouponLoading(false)
  }

  return (
    <>
      <SEO title="Shopping Cart" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold font-heading mb-8">Shopping Cart</h1>

        {loading ? <Loader className="py-20" /> : !cart?.items?.length ? (
          <div className="text-center py-20">
            <p className="text-pm-gray text-lg mb-6">Your cart is empty</p>
            <Link to="/shop" className="bg-pm-secondary text-pm-primary px-8 py-3 rounded-xl font-semibold inline-block">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.items.map(item => (
                  <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-4 p-4 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                    <Link to={`/product/${item.product.slug}`} className="h-24 w-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.product.images?.[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.slug}`} className="font-medium text-sm hover:text-pm-secondary transition truncate block">{item.product.name}</Link>
                      {item.variantName && <p className="text-xs text-pm-gray">{item.variantName}</p>}
                      <p className="text-pm-secondary font-semibold mt-1">{formatPrice(item.variant?.price || item.product.price)}</p>
                    </div>
                    <div className="flex items-center border border-pm-border dark:border-white/10 rounded-lg">
                      <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} className="h-8 w-8 flex items-center justify-center hover:bg-pm-light dark:hover:bg-pm-primary/30 transition text-sm">-</button>
                      <span className="h-8 w-10 flex items-center justify-center text-sm border-x border-pm-border dark:border-white/10">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-pm-light dark:hover:bg-pm-primary/30 transition text-sm">+</button>
                    </div>
                    <p className="font-semibold w-24 text-right">{formatPrice((item.variant?.price || item.product.price) * item.quantity)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-pm-gray hover:text-red-500 transition p-1">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="flex items-center justify-between pt-4">
                <Link to="/shop" className="text-sm text-pm-secondary hover:text-pm-secondary-light transition">← Continue Shopping</Link>
                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 transition">Clear Cart</button>
              </div>
            </div>

            <div>
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5 sticky top-24">
                <h2 className="font-semibold text-lg mb-6">Order Summary</h2>

                <div className="space-y-1 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-pm-gray">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-pm-success">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-pm-gray">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-4 border-t border-pm-border dark:border-white/10 mt-4">
                    <span>Total</span>
                    <span className="text-pm-secondary">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex gap-2">
                    <input type="text" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pm-secondary" />
                    <button onClick={handleApplyCoupon} disabled={couponLoading} className="bg-pm-primary dark:bg-pm-secondary text-white dark:text-pm-primary px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">{couponLoading ? '...' : 'Apply'}</button>
                  </div>
                  {coupon && <p className="text-pm-success text-xs mt-2">Coupon applied! ({coupon.code})</p>}
                  {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                </div>

                <button onClick={() => navigate('/checkout')} className="w-full bg-pm-secondary text-pm-primary py-3.5 rounded-xl font-semibold hover:bg-pm-secondary-light transition">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
