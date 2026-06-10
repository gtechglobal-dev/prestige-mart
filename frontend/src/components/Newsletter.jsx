import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <section className="gradient-dark py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center">
          <span className="text-pm-secondary text-sm uppercase tracking-[0.2em]">Stay Connected</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading mt-4">Join the Prestige Club</h2>
          <p className="text-white/60 mt-4">Subscribe for exclusive access to new collections, limited drops, and members-only offers.</p>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="flex-1 bg-white/10 text-white placeholder-white/40 rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-pm-secondary border border-white/10" />
            <button type="submit" className="bg-pm-secondary text-pm-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-pm-secondary-light transition whitespace-nowrap">
              Subscribe
            </button>
          </form>
          {status === 'success' && <p className="mt-4 text-pm-success text-sm">Thank you for subscribing!</p>}
        </motion.div>
      </div>
    </section>
  )
}
