import { describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import Navbar from './Navbar'
import { renderWithRouter } from '../test/render'

const mocks = vi.hoisted(() => ({
  auth: { user: null, signOut: vi.fn() },
  theme: { theme: 'light', toggleTheme: vi.fn() },
  toast: { info: vi.fn(), error: vi.fn() },
}))

vi.mock('../contexts/AuthContext', () => ({ useAuth: () => mocks.auth }))
vi.mock('../contexts/ThemeContext', () => ({ useTheme: () => mocks.theme }))
vi.mock('../contexts/ToastContext', () => ({ useToast: () => mocks.toast }))

function renderNavbar() {
  return renderWithRouter(
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<p>home route</p>} />
        <Route path="/register" element={<p>register route</p>} />
      </Routes>
    </>,
  )
}

describe('Navbar', () => {
  it('shows Sign in and Sign up to guests and drops Start writing', () => {
    mocks.auth.user = null
    const { container } = renderNavbar()
    const actions = container.querySelector('.nav-actions')

    expect(within(actions).getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
    expect(within(actions).getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register')
    expect(within(actions).queryByRole('link', { name: /Start writing/i })).not.toBeInTheDocument()
  })

  it('hides Sign up and keeps the user menu when signed in', async () => {
    const user = userEvent.setup()
    mocks.auth.user = { displayName: 'Aarav Mehta', email: 'demo@inkwell.blog' }
    const { container } = renderNavbar()
    const actions = container.querySelector('.nav-actions')

    expect(within(actions).queryByRole('link', { name: 'Sign up' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Aarav/ }))

    expect(screen.getByRole('menuitem', { name: /Dashboard/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Write a post/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Sign out/ })).toBeInTheDocument()
  })

  it('reaches Sign up with the keyboard and follows it', async () => {
    const user = userEvent.setup()
    mocks.auth.user = null
    renderNavbar()

    let signUp = null
    for (let step = 0; step < 15; step += 1) {
      await user.tab()
      if (document.activeElement?.textContent?.trim() === 'Sign up') {
        signUp = document.activeElement
        break
      }
    }

    expect(signUp).not.toBeNull()
    await user.keyboard('{Enter}')
    expect(await screen.findByText('register route')).toBeInTheDocument()
  })
})
