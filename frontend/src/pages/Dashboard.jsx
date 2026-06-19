import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { orderAPI, wishlistAPI, userAPI, authAPI, reviewAPI } from '../api'
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers'
import SEO from '../components/SEO'
import { Loader } from '../components/Loader'

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
  { id: 'addresses', label: 'Addresses', icon: '📍' },
  { id: 'profile', label: 'Profile', icon: '👤' },
]

export default function Dashboard() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' })
  const [profileMessage, setProfileMessage] = useState('')
  const [addressForm, setAddressForm] = useState({ label: '', street: '', city: '', state: '', country: 'Nigeria', zip: '', isDefault: false })
  const [addressFormVisible, setAddressFormVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash) setActiveTab(hash)
  }, [location])

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderAPI.getAll,
    enabled: activeTab === 'orders' || activeTab === 'overview'
  })

  const { data: wishlist, isLoading: wishlistLoading } = useQuery({
    queryKey: ['my-wishlist'],
    queryFn: wishlistAPI.get,
    enabled: activeTab === 'wishlist'
  })

  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: userAPI.getAddresses,
    enabled: activeTab === 'addresses'
  })

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      await authAPI.updateProfile(profileForm)
      updateUser(profileForm)
      setProfileMessage('Profile updated!')
      setTimeout(() => setProfileMessage(''), 3000)
    } catch { setProfileMessage('Update failed') }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      if (editingAddress) { await userAPI.updateAddress(editingAddress, addressForm) } else { await userAPI.createAddress(addressForm) }
      setAddressForm({ label: '', street: '', city: '', state: '', country: 'Nigeria', zip: '', isDefault: false })
      setAddressFormVisible(false)
      setEditingAddress(null)
      refetchAddresses()
    } catch { }
  }

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return
    await userAPI.deleteAddress(id)
    refetchAddresses()
  }

  if (!user) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><h1 className="text-3xl font-bold font-heading mb-4">Dashboard</h1><p className="text-pm-gray mb-6">Please sign in.</p><Link to="/login" className="bg-pm-secondary text-pm-primary px-8 py-3 rounded-xl font-semibold inline-block">Sign In</Link></div>

  return (
    <>
      <SEO title="My Dashboard" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">My Account</h1>
            <p className="text-pm-gray text-sm mt-1">Welcome back, {user.firstName}</p>
          </div>
          <button onClick={() => { logout(); navigate('/') }} className="text-sm text-red-500 hover:text-red-600 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg">Sign Out</button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === tab.id ? 'bg-pm-secondary/10 text-pm-secondary' : 'text-pm-gray hover:bg-pm-light dark:hover:bg-pm-primary/30'}`}>
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Orders', value: orders?.length || 0, icon: '📦' },
                    { label: 'Wishlist', value: wishlist?.length || 0, icon: '❤️' },
                    { label: 'Addresses', value: addresses?.length || 0, icon: '📍' },
                    { label: 'Member Since', value: formatDate(user.createdAt || Date.now()), icon: '🎉' },
                  ].map(s => (
                    <div key={s.label} className="p-4 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                      <span className="text-2xl">{s.icon}</span>
                      <p className="text-2xl font-bold mt-2">{s.value}</p>
                      <p className="text-xs text-pm-gray">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                  <h2 className="font-semibold mb-4">Recent Orders</h2>
                  {ordersLoading ? <Loader /> : Array.isArray(orders) && orders.slice(0, 5).map(order => (
                    <Link key={order.id} to={`/dashboard/orders#${order.id}`} className="flex items-center justify-between py-3 border-b border-pm-border dark:border-white/5 last:border-0 text-sm">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-pm-gray text-xs">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <h2 className="font-semibold text-lg mb-6">My Orders</h2>
                {ordersLoading ? <Loader /> : orders?.length === 0 ? <p className="text-pm-gray text-center py-8">No orders yet.</p> : (
                  <div className="space-y-4">
                    {orders?.map(order => (
                      <div key={order.id} className="p-4 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-sm">{order.orderNumber}</p>
                            <p className="text-xs text-pm-gray">{formatDate(order.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {order.items?.map(item => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              <img src={item.image || item.product?.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{item.name}</p>
                                <p className="text-pm-gray text-xs">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                              <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-pm-border dark:border-white/5 text-sm">
                          <span className="text-pm-gray">{order.items?.length} item(s)</span>
                          <span className="font-semibold">Total: {formatPrice(order.total)}</span>
                        </div>
                        {order.status === 'PENDING' && (
                          <button onClick={async () => { try { await orderAPI.cancel(order.id, { reason: 'Customer request' }) } catch { } }} className="mt-3 text-xs text-red-500 hover:text-red-600">Cancel Order</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <h2 className="font-semibold text-lg mb-6">My Wishlist</h2>
                {wishlistLoading ? <Loader /> : wishlist?.length === 0 ? <p className="text-pm-gray text-center py-8">Your wishlist is empty.</p> : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {wishlist?.map(product => (
                      <Link key={product.id} to={`/product/${product.slug}`} className="group">
                        <div className="aspect-square rounded-xl overflow-hidden bg-pm-light dark:bg-pm-primary/50">
                          <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <p className="text-sm font-medium mt-2 truncate">{product.name}</p>
                        <p className="text-pm-secondary font-semibold text-sm">{formatPrice(product.price)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg">My Addresses</h2>
                  <button onClick={() => { setAddressFormVisible(!addressFormVisible); setEditingAddress(null); setAddressForm({ label: '', street: '', city: '', state: '', country: 'Nigeria', zip: '', isDefault: false }) }} className="text-sm text-pm-secondary hover:text-pm-secondary-light font-medium">
                    {addressFormVisible ? 'Cancel' : '+ Add Address'}
                  </button>
                </div>
                {addressFormVisible && (
                  <form onSubmit={handleAddAddress} className="mb-6 p-4 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Label (e.g. Home, Office)" value={addressForm.label} onChange={e => setAddressForm(a => ({ ...a, label: e.target.value }))} className="px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
                      <input type="text" placeholder="Street" value={addressForm.street} onChange={e => setAddressForm(a => ({ ...a, street: e.target.value }))} required className="px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input type="text" placeholder="City" value={addressForm.city} onChange={e => setAddressForm(a => ({ ...a, city: e.target.value }))} required className="px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
                      <input type="text" placeholder="State" value={addressForm.state} onChange={e => setAddressForm(a => ({ ...a, state: e.target.value }))} required className="px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
                      <input type="text" placeholder="ZIP" value={addressForm.zip} onChange={e => setAddressForm(a => ({ ...a, zip: e.target.value }))} className="px-4 py-2.5 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm(a => ({ ...a, isDefault: e.target.checked }))} className="accent-pm-secondary" />
                      Set as default address
                    </label>
                    <button type="submit" className="bg-pm-secondary text-pm-primary px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-pm-secondary-light transition">
                      {editingAddress ? 'Update Address' : 'Add Address'}
                    </button>
                  </form>
                )}
                <div className="space-y-3">
                  {addresses?.map(addr => (
                    <div key={addr.id} className="flex items-start justify-between p-4 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/5">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{addr.label || 'Address'}</p>
                          {addr.isDefault && <span className="text-xs bg-pm-secondary/10 text-pm-secondary px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-sm text-pm-gray mt-1">{addr.street}, {addr.city}</p>
                        <p className="text-sm text-pm-gray">{addr.state}, {addr.country}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingAddress(addr.id); setAddressForm(addr); setAddressFormVisible(true) }} className="text-xs text-pm-secondary hover:text-pm-secondary-light">Edit</button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-red-500 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <h2 className="font-semibold text-lg mb-6">Profile Settings</h2>
                {profileMessage && <div className="mb-4 p-3 rounded-xl bg-pm-success/10 border border-pm-success/20 text-pm-success text-sm">{profileMessage}</div>}
                <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input type="text" value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input type="text" value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input type="tel" value={profileForm.phone || ''} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={user.email} disabled className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none cursor-not-allowed" />
                  </div>
                  <button type="submit" className="bg-pm-secondary text-pm-primary px-8 py-3 rounded-xl font-semibold hover:bg-pm-secondary-light transition">Save Changes</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
