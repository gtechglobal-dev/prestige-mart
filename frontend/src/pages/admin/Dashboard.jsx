import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../api'
import { formatPrice, formatDate } from '../../utils/helpers'
import SEO from '../../components/SEO'
import { Loader, PageLoader } from '../../components/Loader'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminAPI.getDashboard,
    refetchInterval: 30000
  })

  if (isLoading) return <PageLoader />

  const stats = [
    { label: 'Total Revenue', value: formatPrice(data?.totalRevenue || 0), icon: '💰', color: 'text-pm-secondary' },
    { label: 'Orders', value: data?.ordersCount || 0, icon: '📦', color: 'text-blue-500' },
    { label: 'Customers', value: data?.customersCount || 0, icon: '👥', color: 'text-green-500' },
    { label: 'Products', value: data?.productsCount || 0, icon: '🛍️', color: 'text-purple-500' },
  ]

  return (
    <>
      <SEO title="Admin Dashboard" />
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">Admin Dashboard</h1>
            <p className="text-pm-gray text-sm mt-1">Welcome to Prestige Mart admin panel</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/products" className="text-sm px-4 py-2 border border-pm-border dark:border-white/10 rounded-lg hover:bg-pm-light dark:hover:bg-pm-primary/30 transition">Manage Products</Link>
            <Link to="/admin/orders" className="text-sm px-4 py-2 border border-pm-border dark:border-white/10 rounded-lg hover:bg-pm-light dark:hover:bg-pm-primary/30 transition">Manage Orders</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="p-5 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-xs font-medium ${s.color}`}>+{Math.floor(Math.random() * 20 + 5)}%</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-pm-gray mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
            <h2 className="font-semibold text-lg mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {data?.recentOrders?.map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-pm-border dark:border-white/5 last:border-0 text-sm">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-pm-gray text-xs">{order.user?.firstName} {order.user?.lastName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{order.status}</span>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
            <h2 className="font-semibold text-lg mb-4">Revenue (Last 30 Days)</h2>
            <div className="flex items-end gap-2 h-40">
              {Array.isArray(data?.revenueData) && data.revenueData.slice(-14).map((d, i) => {
                const max = Math.max(...(data?.revenueData?.map(r => r._sum?.total || 0) || [0]), 1)
                const height = ((d._sum?.total || 0) / max) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-pm-secondary/20 rounded-t relative" style={{ height: `${Math.max(height, 2)}%` }}>
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-xs text-pm-gray whitespace-nowrap">{formatPrice(d._sum?.total || 0)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
          <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Add Product', link: '/admin/products', icon: '➕' },
              { label: 'View Orders', link: '/admin/orders', icon: '📋' },
              { label: 'Create Coupon', link: '/admin/coupons', icon: '🏷️' },
              { label: 'Analytics', link: '/admin/analytics', icon: '📈' },
            ].map(a => (
              <Link key={a.label} to={a.link} className="p-4 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/5 text-center hover:border-pm-secondary transition">
                <span className="text-2xl block mb-2">{a.icon}</span>
                <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
