import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SEO from '../../components/SEO'

const sidebarLinks = [
  { label: 'Dashboard', path: '/admin', icon: '📊' },
  { label: 'Products', path: '/admin/products', icon: '🛍️' },
  { label: 'Orders', path: '/admin/orders', icon: '📦' },
  { label: 'Customers', path: '/admin/customers', icon: '👥' },
  { label: 'Coupons', path: '/admin/coupons', icon: '🏷️' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
]

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user || user.role !== 'ADMIN') {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><h1 className="text-3xl font-bold font-heading mb-4">Access Denied</h1><p className="text-pm-gray">You don't have permission to access this area.</p><Link to="/" className="mt-6 inline-block bg-pm-secondary text-pm-primary px-8 py-3 rounded-xl font-semibold">Go Home</Link></div>
  }

  return (
    <>
      <SEO title="Admin" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="space-y-1">
            {sidebarLinks.map(link => (
              <Link key={link.path} to={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${location.pathname === link.path ? 'bg-pm-secondary/10 text-pm-secondary' : 'text-pm-gray hover:bg-pm-light dark:hover:bg-pm-primary/30'}`}>
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-pm-gray hover:bg-pm-light dark:hover:bg-pm-primary/30 transition mt-4">
              <span>←</span>
              Back to Store
            </Link>
          </div>
          <div className="lg:col-span-4">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}
