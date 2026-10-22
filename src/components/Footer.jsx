import { Link } from 'react-router-dom'
import { isDemo } from '../lib/backend'
import { CATEGORIES, SITE } from '../lib/constants'
import { Icon, LogoMark } from './Icons'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link to="/" className="brand" aria-label="Inkwell — home">
            <LogoMark size={34} />
            <span className="brand-word">
              Inkwell<span className="brand-dot">.</span>
            </span>
          </Link>
          <p className="footer-tagline">{SITE.description}</p>
          <div className="footer-status">
            <span className={`status-dot${isDemo ? ' is-demo' : ''}`} />
            {isDemo ? 'Demo mode · data stays in this browser' : 'Connected to Firebase'}
          </div>
        </div>

        <div className="footer-col">
          <h3>Read</h3>
          <Link to="/explore">All stories</Link>
          {CATEGORIES.slice(0, 3).map((category) => (
            <Link key={category} to={`/explore?category=${encodeURIComponent(category)}`}>
              {category}
            </Link>
          ))}
        </div>

        <div className="footer-col">
          <h3>Write</h3>
          <Link to="/write">New post</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Create account</Link>
        </div>

        <div className="footer-col">
          <h3>Build</h3>
          <Link to="/guide">Deployment guide</Link>
          <Link to="/guide#security">Security rules</Link>
          <Link to="/guide#troubleshooting">Troubleshooting</Link>
          <a href="https://firebase.google.com/docs" target="_blank" rel="noreferrer">
            Firebase docs <Icon name="external" size={13} />
          </a>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} Inkwell. Written with care.</p>
        <p className="footer-stack">React · Vite · Firebase Auth · Firestore</p>
      </div>
    </footer>
  )
}
