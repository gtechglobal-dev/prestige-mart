import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] hero-gradient overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pm-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pm-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pm-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block text-pm-secondary text-sm uppercase tracking-[0.2em] font-medium mb-6">Premium Luxury Collection</span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white font-heading leading-tight">
              Elevate Your<br />
              <span className="text-gradient">Style</span> Today
            </h1>
            <p className="mt-6 text-lg text-white/60 max-w-lg leading-relaxed">
              Discover Nigeria's finest luxury fashion and lifestyle destination. From designer apparel to exquisite accessories, find everything you need to make a statement.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-pm-secondary text-pm-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-pm-secondary-light transition shadow-lg shadow-pm-secondary/25">
                Shop Now
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link to="/categories" className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/5 transition">
                Explore Collection
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-10">
              {[{ number: '500+', label: 'Products' }, { number: '10K+', label: 'Happy Customers' }, { number: '4.9', label: 'Rating' }].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.number}</p>
                  <p className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-pm-secondary/20 to-transparent rounded-full blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'].map((img, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className={`rounded-2xl overflow-hidden ${i === 0 ? 'row-span-2' : ''}`}>
                    <img src={img} alt="" className={`w-full h-full object-cover ${i === 0 ? 'aspect-[3/5]' : 'aspect-square'}`} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
