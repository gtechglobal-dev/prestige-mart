import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SEO from '../../components/SEO'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title="Sign In" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-heading">Welcome Back</h1>
            <p className="text-pm-gray mt-2">Sign in to your Prestige Mart account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-pm-secondary text-pm-primary py-3.5 rounded-xl font-semibold hover:bg-pm-secondary-light transition disabled:opacity-50">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-pm-gray mt-6">
            Don't have an account? <Link to="/register" className="text-pm-secondary hover:underline font-medium">Create Account</Link>
          </p>
        </div>
      </div>
    </>
  )
}
