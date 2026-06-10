import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SEO from '../../components/SEO'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title="Create Account" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-heading">Create Account</h1>
            <p className="text-pm-gray mt-2">Join the Prestige Mart community</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">First Name</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last Name</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone (Optional)</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" placeholder="+234 800 000 0000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-pm-primary/50 border border-pm-border dark:border-white/10 outline-none focus:ring-2 focus:ring-pm-secondary" placeholder="Confirm your password" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-pm-secondary text-pm-primary py-3.5 rounded-xl font-semibold hover:bg-pm-secondary-light transition disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-pm-gray mt-6">
            Already have an account? <Link to="/login" className="text-pm-secondary hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </>
  )
}
