import { useState } from 'react'
import { Link } from 'react-router-dom'
import { isDemo } from '../lib/backend'
import { Icon } from './Icons'

const DISMISS_KEY = 'inkwell.demo-bar.dismissed'

export default function DemoBar() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return false
    }
  })

  if (!isDemo || dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="demo-bar">
      <div className="container demo-bar-inner">
        <span className="demo-pill">Demo mode</span>
        <p>
          You are exploring with local sample data. Add your Firebase keys to go live in about 10 minutes.
        </p>
        <Link to="/guide" className="demo-bar-link">
          Open the guide <Icon name="arrowRight" size={14} />
        </Link>
        <button type="button" className="demo-bar-close" onClick={dismiss} aria-label="Dismiss demo notice">
          <Icon name="close" size={15} />
        </button>
      </div>
    </div>
  )
}
