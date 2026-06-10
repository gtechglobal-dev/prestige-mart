import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-white dark:bg-pm-dark text-pm-primary dark:text-white transition-colors">
      <Navbar />
      <main className="pt-16 lg:pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
