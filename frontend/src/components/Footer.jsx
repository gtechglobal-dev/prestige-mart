import { Link } from 'react-router-dom'

export default function Footer() {
  const categories = [{ name: 'Fashion', slug: 'fashion' }, { name: 'Shoes', slug: 'shoes' }, { name: 'Watches', slug: 'watches' }, { name: 'Electronics', slug: 'electronics' }, { name: 'Beauty', slug: 'beauty' }, { name: 'Accessories', slug: 'accessories' }, { name: 'Bags', slug: 'bags' }, { name: 'Perfumes', slug: 'perfumes' }]
  const quickLinks = [{ name: 'About Us', path: '/about' }, { name: 'Contact', path: '/contact' }, { name: 'FAQ', path: '/faq' }, { name: 'Shipping', path: '/shipping' }, { name: 'Returns', path: '/returns' }, { name: 'Privacy Policy', path: '/privacy' }]

  return (
    <footer className="bg-pm-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="text-2xl font-bold text-pm-secondary font-heading">PRESTIGE <span className="text-white font-light">MART</span></Link>
            <p className="mt-4 text-white/60 text-sm leading-relaxed">
              Nigeria's premier luxury fashion and lifestyle destination. We bring you the finest collections from around the world.
            </p>
            <div className="mt-6 flex gap-4">
              {['instagram', 'facebook', 'twitter', 'youtube'].map(social => (
                <a key={social} href={`https://${social}.com/prestigemartng`} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-pm-secondary hover:text-pm-primary transition">
                  <span className="text-xs uppercase font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-widest text-pm-secondary mb-6">Categories</h3>
            <ul className="space-y-3">
              {categories.map(cat => (
                <li key={cat.slug}>
                  <Link to={`/shop?category=${cat.slug}`} className="text-white/60 hover:text-pm-secondary transition text-sm">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-widest text-pm-secondary mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/60 hover:text-pm-secondary transition text-sm">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-widest text-pm-secondary mb-6">Contact</h3>
            <div className="space-y-3 text-sm text-white/60">
              <p>Lagos, Nigeria</p>
              <p>+234 800 PRESTIGE</p>
              <p>hello@prestigemart.ng</p>
              <p className="text-white/40 text-xs mt-4">Mon - Sat: 9AM - 6PM</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Prestige Mart. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Designed &amp; Developed by Gtech Global
          </p>
        </div>
      </div>
    </footer>
  )
}
