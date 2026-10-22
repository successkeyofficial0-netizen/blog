import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Inkwell crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash-screen">
          <div className="crash-card">
            <span className="eyebrow">Something broke</span>
            <h1>The page hit an unexpected error.</h1>
            <p>
              Your data is safe. Reload the page to keep writing, or check the browser console for
              details.
            </p>
            <pre>{String(this.state.error?.message || this.state.error)}</pre>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.location.assign('/')}
            >
              Back to Inkwell
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
