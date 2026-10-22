import { Link } from 'react-router-dom'
import { Icon } from '../components/Icons'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <section className="not-found">
      <div className="container not-found-inner">
        <span className="not-found-code">404</span>
        <span className="eyebrow">A wrong turn</span>
        <h1>
          This page went <em>missing.</em>
        </h1>
        <p>
          The link may be old, the story may have been unpublished, or the address has a typo. The
          good writing is still where you left it.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Back home <Icon name="arrowRight" size={16} />
          </Link>
          <Link to="/explore" className="btn btn-secondary">
            Explore stories
          </Link>
        </div>
      </div>
    </section>
  )
}
