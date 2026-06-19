import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import Newsletter from '../components/Newsletter'
import SEO from '../components/SEO'
import { productAPI, categoryAPI } from '../api'
import { Loader } from '../components/Loader'

const features = [
  { icon: '🚚', title: 'Fast Delivery', desc: 'Free delivery on orders over ₦50,000. Delivered within 24-48 hours.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Pay safely with Paystack, Flutterwave, or bank transfer.' },
  { icon: '✅', title: 'Authentic Products', desc: '100% genuine products with authenticity guarantee.' },
  { icon: '💬', title: '24/7 Support', desc: 'Dedicated support team ready to help you anytime.' },
]

const testimonials = [
  { name: 'Chioma Okafor', location: 'Lagos', rating: 5, text: 'Prestige Mart is my go-to for luxury fashion. The quality is outstanding and delivery is always on time.' },
  { name: 'Tunde Balogun', location: 'Abuja', rating: 5, text: 'I bought a Rolex from them. Authentic product, great price, professional service. Highly recommended!' },
  { name: 'Amina Suleiman', location: 'Kano', rating: 4, text: 'Beautiful collection of bags and accessories. The customer service team went above and beyond.' },
  { name: 'Emeka Nwosu', location: 'Port Harcourt', rating: 5, text: 'Finally a Nigerian luxury store I can trust. Premium products, fair prices, excellent experience.' },
]

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useQuery({ queryKey: ['featured-products'], queryFn: productAPI.getFeatured })
  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery({ queryKey: ['best-sellers'], queryFn: productAPI.getBestSellers })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryAPI.getAll })

  const categoryIcons = ['👔', '👟', '⌚', '📱', '💄', '👜', '🎒', '👗', '🏠', '💍']

  return (
    <>
      <SEO />
      <Hero />

      <section className="py-20 bg-white dark:bg-pm-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5 card-hover">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="text-lg font-semibold mt-4">{f.title}</h3>
                <p className="text-sm text-pm-gray mt-2 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-pm-light dark:bg-pm-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-pm-secondary text-sm uppercase tracking-[0.2em]">Categories</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2">Shop by Category</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories?.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/shop?category=${cat.slug}`} className="block p-6 rounded-2xl bg-white dark:bg-pm-primary/30 border border-pm-border dark:border-white/5 card-hover text-center group">
                  <span className="text-4xl block mb-3">{categoryIcons[i % categoryIcons.length]}</span>
                  <h3 className="font-medium text-sm group-hover:text-pm-secondary transition">{cat.name}</h3>
                  <p className="text-xs text-pm-gray mt-1">{cat._count?.products || 0} Products</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {Array.isArray(featured) && featured.length > 0 && (
        <section className="py-20 bg-white dark:bg-pm-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
              <div>
                <span className="text-pm-secondary text-sm uppercase tracking-[0.2em]">Featured</span>
                <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2">Featured Products</h2>
              </div>
              <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-pm-secondary hover:text-pm-secondary-light font-medium text-sm transition">
                View All <span>→</span>
              </Link>
            </motion.div>
            {featuredLoading ? <Loader className="py-20" /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {featured.slice(0, 10).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-20 bg-pm-light dark:bg-pm-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
            <div>
              <span className="text-pm-secondary text-sm uppercase tracking-[0.2em]">Popular</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2">Best Sellers</h2>
            </div>
          </motion.div>
          {bestSellersLoading ? <Loader className="py-20" /> : Array.isArray(bestSellers) && bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {bestSellers.slice(0, 10).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-pm-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-pm-secondary text-sm uppercase tracking-[0.2em]">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2">What Our Customers Say</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 rounded-2xl bg-pm-light dark:bg-pm-primary/30 border border-pm-border dark:border-white/5">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-pm-secondary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-sm text-pm-gray leading-relaxed">"{t.text}"</p>
                <div className="mt-4 pt-4 border-t border-pm-border dark:border-white/10">
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-pm-gray">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-pm-light dark:bg-pm-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-pm-secondary text-sm uppercase tracking-[0.2em]">Instagram</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mt-2">Follow Us @prestigemartng</h2>
          </motion.div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <a key={i} href="https://instagram.com/prestigemartng" target="_blank" rel="noopener noreferrer" className="aspect-square rounded-xl overflow-hidden group relative">
                <img src={`https://images.unsplash.com/photo-${['1593030761757-71fae45fa0e7', '1542291026-7eec264c27ff', '1547996160-81dfa63595aa', '1584917865442-de89df76afd3', '1541643600914-78b084683601', '1602751584552-8ba73a1d1d4a'][i]}?w=300`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-pm-primary/0 group-hover:bg-pm-primary/40 transition-colors flex items-center justify-center">
                  <svg className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  )
}
