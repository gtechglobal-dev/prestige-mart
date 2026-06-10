import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderAPI, paymentAPI } from '../api'
import { formatPrice } from '../utils/helpers'
import SEO from '../components/SEO'

export default function Checkout() {
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [shipping, setShipping] = useState({ street: '', city: '', state: '', country: 'Nigeria', zip: '' })
  const [deliveryMethod, setDeliveryMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('paystack')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><h1 className="text-3xl font-bold font-heading mb-4">Checkout</h1><p className="text-pm-gray mb-6">Please sign in to checkout.</p><Link to="/login" className="bg-pm-secondary text-pm-primary px-8 py-3 rounded-xl font-semibold inline-block">Sign In</Link></div>
  }

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.variant?.price || item.product.price) * item.quantity, 0) || 0
  const shippingCost = deliveryMethod === 'express' ? 5000 : subtotal >= 50000 ? 0 : 2500
  const tax = subtotal * 0.075
  const total = subtotal + shippingCost + tax

  const createOrderMutation = useMutation({
    mutationFn: (data) => orderAPI.create(data),
    onSuccess: async (res) => {
      const order = res.data.order
      if (paymentMethod === 'paystack') {
        const payRes = await paymentAPI.initializePaystack({ orderId: order.id })
        window.location.href = payRes.data.authorization_url
      } else {
        const fwRes = await paymentAPI.initializeFlutterwave({ orderId: order.id })
        window.location.href = fwRes.data.authorization_url
      }
    }
  })

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      await createOrderMutation.mutateAsync({
        shippingAddress: shipping,
        billingAddress: shipping,
        note,
        deliveryMethod
      })
      await clearCart()
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed')
    }
    setLoading(false)
  }

  return (
    <>
      <SEO title="Checkout" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-4 mb-10">
          {[{ n: 1, label: 'Shipping' }, { n: 2, label: 'Delivery' }, { n: 3, label: 'Payment' }, { n: 4, label: 'Review' }].map(s => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s.n ? 'bg-pm-secondary text-pm-primary' : 'bg-pm-border dark:bg-white/10 text-pm-gray'}`}>{s.n}</div>
              <span className={`text-sm hidden sm:inline ${step >= s.n ? 'font-medium' : 'text-pm-gray'}`}>{s.label}</span>
              {s.n < 4 && <div className={`h-px w-8 sm:w-12 ${step > s.n ? 'bg-pm-secondary' : 'bg-pm-border dark:bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <h2 className="text-xl font-bold font-heading mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input type="text" value={user.firstName} readOnly className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input type="text" value={user.lastName} readOnly className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none cursor-not-allowed" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Street Address</label>
                    <input type="text" value={shipping.street} onChange={e => setShipping(s => ({ ...s, street: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input type="text" value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input type="text" value={shipping.state} onChange={e => setShipping(s => ({ ...s, state: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Country</label>
                      <input type="text" value={shipping.country} readOnly className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP Code</label>
                      <input type="text" value={shipping.zip} onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className="w-full bg-pm-secondary text-pm-primary py-3.5 rounded-xl font-semibold hover:bg-pm-secondary-light transition mt-4">
                    Continue to Delivery
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <h2 className="text-xl font-bold font-heading mb-6">Delivery Method</h2>
                <div className="space-y-4">
                  {[{ id: 'standard', label: 'Standard Delivery', desc: '3-5 business days', cost: subtotal >= 50000 ? 'Free' : '₦2,500' }, { id: 'express', label: 'Express Delivery', desc: '1-2 business days', cost: '₦5,000' }].map(m => (
                    <label key={m.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${deliveryMethod === m.id ? 'border-pm-secondary bg-pm-secondary/5' : 'border-pm-border dark:border-white/10 hover:border-pm-secondary'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="delivery" value={m.id} checked={deliveryMethod === m.id} onChange={e => setDeliveryMethod(e.target.value)} className="accent-pm-secondary" />
                        <div>
                          <p className="font-medium">{m.label}</p>
                          <p className="text-sm text-pm-gray">{m.desc}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-pm-secondary">{m.cost}</p>
                    </label>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setStep(1)} className="px-6 py-3 border border-pm-border dark:border-white/10 rounded-xl text-sm font-medium hover:bg-pm-light dark:hover:bg-pm-primary/30 transition">Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 bg-pm-secondary text-pm-primary py-3 rounded-xl font-semibold hover:bg-pm-secondary-light transition">Continue to Payment</button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <h2 className="text-xl font-bold font-heading mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {[{ id: 'paystack', label: 'Paystack', desc: 'Pay with card, USSD, or bank transfer' }, { id: 'flutterwave', label: 'Flutterwave', desc: 'Pay with card, Mobile Money, or Bank' }].map(m => (
                    <label key={m.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${paymentMethod === m.id ? 'border-pm-secondary bg-pm-secondary/5' : 'border-pm-border dark:border-white/10 hover:border-pm-secondary'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={e => setPaymentMethod(e.target.value)} className="accent-pm-secondary" />
                        <div>
                          <p className="font-medium">{m.label}</p>
                          <p className="text-sm text-pm-gray">{m.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setStep(2)} className="px-6 py-3 border border-pm-border dark:border-white/10 rounded-xl text-sm font-medium hover:bg-pm-light dark:hover:bg-pm-primary/30 transition">Back</button>
                    <button onClick={() => setStep(4)} className="flex-1 bg-pm-secondary text-pm-primary py-3 rounded-xl font-semibold hover:bg-pm-secondary-light transition">Review Order</button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <h2 className="text-xl font-bold font-heading mb-6">Order Review</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-xl bg-white dark:bg-pm-primary/50">
                    <h3 className="font-medium text-sm mb-2">Shipping To</h3>
                    <p className="text-sm text-pm-gray">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-pm-gray">{shipping.street}, {shipping.city}</p>
                    <p className="text-sm text-pm-gray">{shipping.state}, {shipping.country}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Delivery:</span>
                    <span className="text-pm-gray capitalize">{deliveryMethod}</span>
                    <span className="font-medium ml-4">Payment:</span>
                    <span className="text-pm-gray capitalize">{paymentMethod}</span>
                  </div>
                </div>
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cart?.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <img src={item.product.images?.[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.product.name}</p>
                        <p className="text-pm-gray">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice((item.variant?.price || item.product.price) * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <textarea placeholder="Order note (optional)" value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full mb-4 px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary resize-none" />
                <div className="flex gap-3 pt-4 border-t border-pm-border dark:border-white/10">
                  <button onClick={() => setStep(3)} className="px-6 py-3 border border-pm-border dark:border-white/10 rounded-xl text-sm font-medium hover:bg-pm-light dark:hover:bg-pm-primary/30 transition">Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading || createOrderMutation.isPending} className="flex-1 bg-pm-secondary text-pm-primary py-3 rounded-xl font-semibold hover:bg-pm-secondary-light transition disabled:opacity-50">
                    {loading || createOrderMutation.isPending ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {cart?.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img src={item.product.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{item.product.name}</p>
                      <p className="text-pm-gray text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-xs">{formatPrice((item.variant?.price || item.product.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-pm-border dark:border-white/10 pt-4">
                <div className="flex justify-between"><span className="text-pm-gray">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-pm-gray">Shipping</span><span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span></div>
                <div className="flex justify-between"><span className="text-pm-gray">Tax (7.5%)</span><span>{formatPrice(tax)}</span></div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-pm-border dark:border-white/10">
                  <span>Total</span>
                  <span className="text-pm-secondary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
