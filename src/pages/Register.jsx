import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { Spinner } from '../components/Feedback'
import { Icon } from '../components/Icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { friendlyError } from '../lib/utils'

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent']

function strengthOf(password) {
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return Math.min(score, 4)
}

export default function Register() {
  useDocumentTitle('Create account')
  const { user, signUp, isDemo } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const strength = useMemo(() => strengthOf(form.password), [form.password])
  const strengthLabel = form.password ? STRENGTH_LABELS[strength] : ''

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
    if (error) setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.name.trim().length < 2) {
      setError('Please tell us your name — at least 2 characters.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 6) {
      setError('Choose a password with at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.')
      return
    }

    setBusy(true)
    try {
      await signUp(form.name, form.email, form.password)
      toast.success(`Welcome, ${form.name.trim().split(' ')[0]}! Your account is ready.`)
    } catch (signUpError) {
      setError(friendlyError(signUpError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <div className="auth-head">
        <span className="eyebrow">Start writing</span>
        <h1>
          Create your <em>account.</em>
        </h1>
        <p>One account for your drafts, published stories and reading list.</p>
      </div>

      {error && (
        <div className="form-alert" role="alert">
          <Icon name="alert" size={17} />
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Your name</span>
          <div className="input-wrap">
            <Icon name="user" size={17} />
            <input
              type="text"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Aarav Mehta"
              autoComplete="name"
              required
            />
          </div>
        </label>

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
              placeholder="At least 6 characters"
              autoComplete="new-password"
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

        {form.password && (
          <div className="strength">
            <div className="strength-bars">
              {[0, 1, 2, 3].map((index) => (
                <span key={index} className={index < strength ? `is-filled level-${strength}` : ''} />
              ))}
            </div>
            <span className="strength-label">{strengthLabel}</span>
          </div>
        )}

        <label className="field">
          <span>Confirm password</span>
          <div className="input-wrap">
            <Icon name="shield" size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.confirm}
              onChange={(event) => update('confirm', event.target.value)}
              placeholder="Type it again"
              autoComplete="new-password"
              required
            />
          </div>
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy && <Spinner size={16} />}
          {busy ? 'Creating your account…' : 'Create account'}
          {!busy && <Icon name="arrowRight" size={16} />}
        </button>
      </form>

      {isDemo && (
        <div className="demo-hint">
          <div className="demo-hint-head">
            <span className="demo-pill">Demo mode</span>
          </div>
          <span>
            Accounts created now are stored only in this browser. Add Firebase keys and they become
            real accounts.
          </span>
        </div>
      )}

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
      <p className="auth-legal">
        By creating an account you agree to keep this place kind and useful.
      </p>
    </AuthShell>
  )
}
