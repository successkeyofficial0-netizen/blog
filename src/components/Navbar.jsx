import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { friendlyError } from '../lib/utils'
import Avatar from './Avatar'
import { Icon, LogoMark } from './Icons'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/guide', label: 'Deploy guide' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const toast = useToast()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    setMenuOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  async function handleSignOut() {
    setMenuOpen(false)
    setMobileOpen(false)
    try {
      await signOut()
      toast.info('Signed out. See you soon.')
    } catch (error) {
      toast.error(friendlyError(error))
    }
  }

  const firstName = (user?.displayName || user?.email || 'Writer').split(' ')[0]

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="Inkwell — home">
          <LogoMark size={34} />
          <span className="brand-word">
            Inkwell<span className="brand-dot">.</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to="/explore" className="icon-btn nav-search" aria-label="Search stories">
            <Icon name="search" size={19} />
          </Link>

          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
          </button>

          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button
                type="button"
                className={`user-trigger${menuOpen ? ' is-open' : ''}`}
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <Avatar name={user.displayName || user.email} size="sm" />
                <span className="user-name">{firstName}</span>
                <Icon name="chevronDown" size={14} />
              </button>

              {menuOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="user-dropdown-head">
                    <Avatar name={user.displayName || user.email} size="md" />
                    <div>
                      <p className="user-dropdown-name">{user.displayName || 'Writer'}</p>
                      <p className="user-dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" role="menuitem" className="dropdown-item">
                    <Icon name="grid" size={17} /> Dashboard
                  </Link>
                  <Link to="/write" role="menuitem" className="dropdown-item">
                    <Icon name="pen" size={17} /> Write a post
                  </Link>
                  <Link to="/guide" role="menuitem" className="dropdown-item">
                    <Icon name="book" size={17} /> Deploy guide
                  </Link>
                  <div className="dropdown-divider" />
                  <button type="button" role="menuitem" className="dropdown-item is-danger" onClick={handleSignOut}>
                    <Icon name="logout" size={17} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost nav-signin">
                Sign in
              </Link>
              <Link to="/write" className="btn btn-primary btn-sm nav-cta">
                Start writing <Icon name="arrowUpRight" size={15} />
              </Link>
            </>
          )}

          <button
            type="button"
            className="icon-btn nav-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={21} />
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={`mobile-nav${mobileOpen ? ' is-open' : ''}`}>
        <div className="container mobile-nav-inner">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `mobile-link${isActive ? ' is-active' : ''}`}
            >
              {link.label}
              <Icon name="arrowRight" size={17} />
            </NavLink>
          ))}
          <div className="mobile-divider" />
          {user ? (
            <>
              <Link to="/dashboard" className="mobile-link">
                Dashboard <Icon name="grid" size={17} />
              </Link>
              <Link to="/write" className="mobile-link">
                Write a post <Icon name="pen" size={17} />
              </Link>
              <button type="button" className="mobile-link is-danger" onClick={handleSignOut}>
                Sign out <Icon name="logout" size={17} />
              </button>
            </>
          ) : (
            <div className="mobile-auth">
              <Link to="/login" className="btn btn-secondary btn-block">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-block">
                Create an account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
