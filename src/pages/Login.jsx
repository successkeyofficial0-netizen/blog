import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { Spinner } from '../components/Feedback'
import { Icon } from '../components/Icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { friendlyError } from '../lib/utils'

export default function Login() {
  useDocumentTitle('Sign in')
  const { user, signIn, isDemo, demoLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const requestedFrom = location.state?.from
  const target =
    typeof requestedFrom === 'string' &&
    requestedFrom.startsWith('/') &&
    !requestedFrom.startsWith('/login')
      ? requestedFrom
      : '/dashboard'

  useEffect(() => {
    if (user) navigate(target, { replace: true })
  }, [user, target, navigate])

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
    if (error) setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.email.trim() || !form.password) {
      setError('Please enter both your email and password.')
      return
    }
    setBusy(true)
    try {
      await signIn(form.email, form.password)
      toast.success('Welcome back to Inkwell.')
    } catch (signInError) {
      setError(friendlyError(signInError))
    } finally {
      setBusy(false)
    }
  }

  function fillDemo() {
    if (!demoLogin) return
    setForm({ email: demoLogin.email, password: demoLogin.password })
    setError('')
  }

  return (
    <AuthShell>
      <div className="auth-head">
        <span className="eyebrow">Welcome back</span>
        <h1>
          Sign in to <em>Inkwell.</em>
        </h1>
        <p>Pick up where you left off — your drafts are exactly where you left them.</p>
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
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </label>

        <label className="field">
          <span>Password</span>
          <div className="input-wrap">
            <Icon name="lock" size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <div className="auth-row">
          <span className="auth-hint">
            <Icon name="shield" size={13} /> Encrypted by Firebase
          </span>
          <Link to="/forgot-password" className="text-link">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy && <Spinner size={16} />}
          {busy ? 'Signing in…' : 'Sign in'}
          {!busy && <Icon name="arrowRight" size={16} />}
        </button>
      </form>

      {isDemo && demoLogin && (
        <div className="demo-hint">
          <div className="demo-hint-head">
            <span className="demo-pill">Demo account</span>
            <button type="button" className="text-link" onClick={fillDemo}>
              Fill credentials
            </button>
          </div>
          <p>
            <code>{demoLogin.email}</code>
            <span className="meta-sep">·</span>
            <code>{demoLogin.password}</code>
          </p>
          <span>Demo data lives in this browser. No real account is created.</span>
        </div>
      )}

      <p className="auth-switch">
        New to Inkwell? <Link to="/register">Create an account</Link>
      </p>
      <p className="auth-legal">
        By continuing you agree to keep this place kind and useful.
      </p>
    </AuthShell>
  )
}
