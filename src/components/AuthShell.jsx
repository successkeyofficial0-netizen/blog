import { Link } from 'react-router-dom'
import { Icon, LogoMark } from './Icons'

export default function AuthShell({ children }) {
  return (
    <section className="auth-page">
      <aside className="auth-aside" aria-hidden="true">
        <div className="auth-aside-inner">
          <Link to="/" className="brand brand-light">
            <LogoMark size={34} />
            <span className="brand-word">
              Inkwell<span className="brand-dot">.</span>
            </span>
          </Link>

          <div className="auth-aside-quote">
            <Icon name="sparkles" size={22} />
            <blockquote>
              “The blank page is not empty. It is full of everything you have not said yet.”
            </blockquote>
            <p>Start with one honest paragraph. The polish can come later.</p>
          </div>

          <div className="auth-aside-art">
            <img src="/covers/cover-2.svg" alt="" />
            <img src="/covers/cover-1.svg" alt="" />
          </div>

          <ul className="auth-aside-stats">
            <li>
              <strong>Realtime</strong>
              <span>Firestore posts</span>
            </li>
            <li>
              <strong>Secure</strong>
              <span>Email auth + rules</span>
            </li>
            <li>
              <strong>Bilingual</strong>
              <span>Deploy guide</span>
            </li>
          </ul>
        </div>
      </aside>

      <div className="auth-main">
        <div className="auth-card">{children}</div>
      </div>
    </section>
  )
}
