import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { searchAPI } from '../api'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try { const res = await searchAPI.search(searchQuery); setSearchResults(res.data) } catch { }
      } else { setSearchResults([]) }
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Categories', path: '/categories' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-pm-secondary font-heading">PRESTIGE</span>
            <span className="text-2xl font-light text-white font-heading">MART</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className="text-white/80 hover:text-pm-secondary transition text-sm tracking-wide uppercase">
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-pm-secondary hover:text-pm-secondary-light transition text-sm tracking-wide uppercase">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-white/80 hover:text-pm-secondary transition p-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>

            <button onClick={toggleTheme} className="text-white/80 hover:text-pm-secondary transition p-2">
              {theme === 'light' ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            <Link to="/cart" className="relative text-white/80 hover:text-pm-secondary transition p-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pm-secondary text-pm-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div ref={userMenuRef} className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 text-white/80 hover:text-pm-secondary transition p-2">
                  <div className="h-8 w-8 rounded-full bg-pm-secondary/20 flex items-center justify-center text-pm-secondary font-semibold text-sm">
                    {(user.firstName || 'U')[0]}
                  </div>
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-56 glass-dark rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                      <Link to="/dashboard" className="block px-4 py-3 text-white/80 hover:bg-white/5 hover:text-pm-secondary transition" onClick={() => setShowUserMenu(false)}>Dashboard</Link>
                      <Link to="/dashboard/orders" className="block px-4 py-3 text-white/80 hover:bg-white/5 hover:text-pm-secondary transition" onClick={() => setShowUserMenu(false)}>My Orders</Link>
                      <Link to="/dashboard/wishlist" className="block px-4 py-3 text-white/80 hover:bg-white/5 hover:text-pm-secondary transition" onClick={() => setShowUserMenu(false)}>Wishlist</Link>
                      {isAdmin && <Link to="/admin" className="block px-4 py-3 text-pm-secondary hover:bg-white/5 transition" onClick={() => setShowUserMenu(false)}>Admin Panel</Link>}
                      <button onClick={() => { logout(); setShowUserMenu(false); navigate('/') }} className="block w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 transition border-t border-white/10">
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center gap-2 bg-pm-secondary text-pm-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-pm-secondary-light transition">
                Sign In
              </Link>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white/80 p-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-white/10" ref={searchRef}>
            <div className="max-w-3xl mx-auto px-4 py-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pm-secondary border border-white/10"
                autoFocus
              />
              {searchResults.products?.length > 0 && (
                <div className="mt-3 bg-pm-dark rounded-xl border border-white/10 overflow-hidden max-h-80 overflow-y-auto">
                  {searchResults.products.map(p => (
                    <Link key={p.id} to={`/product/${p.slug}`} onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition">
                      <img src={p.images?.[0]} alt={p.name} className="h-12 w-12 object-cover rounded-lg" />
                      <div>
                        <p className="text-white text-sm font-medium">{p.name}</p>
                        <p className="text-pm-secondary text-xs">₦{p.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-white/10">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="block text-white/80 hover:text-pm-secondary transition py-2">{link.label}</Link>
              ))}
              {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-pm-secondary transition py-2">Admin Panel</Link>}
              {!user && <Link to="/login" onClick={() => setIsOpen(false)} className="block text-pm-secondary transition py-2">Sign In</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
