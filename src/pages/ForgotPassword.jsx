import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { Spinner } from '../components/Feedback'
import { Icon } from '../components/Icons'
import { useAuth } from '../contexts/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { friendlyError } from '../lib/utils'

export default function ForgotPassword() {
  useDocumentTitle('Reset password')
  const { resetPassword, isDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setBusy(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
      setError('')
    } catch (resetError) {
      setError(friendlyError(resetError))
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="auth-success">
          <span className="auth-success-icon">
            <Icon name="mail" size={26} />
          </span>
          <span className="eyebrow">Check your inbox</span>
          <h1>
            Reset link <em>sent.</em>
          </h1>
          <p>
            If an account exists for <strong>{email}</strong>, a password reset email is on its way.
            Follow the link inside to choose a new password.
          </p>
          {isDemo && (
            <div className="demo-hint">
              <span>
                Demo mode: no email is actually sent. Use the demo account or create a new account
                to keep exploring.
              </span>
            </div>
          )}
          <Link to="/login" className="btn btn-primary btn-block">
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="auth-head">
        <span className="eyebrow">Password help</span>
        <h1>
          Reset your <em>password.</em>
        </h1>
        <p>Enter the email linked to your account and we will send you a secure reset link.</p>
      </div>

      {error && (
        <div className="form-alert" role="alert">
          <Icon name="alert" size={17} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Email address</span>
          <div className="input-wrap">
            <Icon name="mail" size={17} />
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (error) setError('')
              }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy && <Spinner size={16} />}
          {busy ? 'Sending…' : 'Send reset link'}
          {!busy && <Icon name="send" size={16} />}
        </button>
      </form>

      <p className="auth-switch">
        Remembered it? <Link to="/login">Back to sign in</Link>
      </p>
      <p className="auth-legal">
        Reset links expire automatically. Check spam if the email does not arrive within a minute.
      </p>
    </AuthShell>
  )
}
