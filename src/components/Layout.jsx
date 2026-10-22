import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DemoBar from './DemoBar'
import Footer from './Footer'
import Navbar from './Navbar'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <DemoBar />
      <Navbar />
      <main id="main" className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
