import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, demoLogin, isDemo } from '../lib/backend'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authApi.subscribe((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async (email, password) => {
    const nextUser = await authApi.signIn(email, password)
    setUser(nextUser)
    return nextUser
  }, [])

  const signUp = useCallback(async (name, email, password) => {
    const nextUser = await authApi.signUp(email, password, name)
    setUser(nextUser)
    return nextUser
  }, [])

  const signOut = useCallback(async () => {
    await authApi.signOut()
    setUser(null)
  }, [])

  const resetPassword = useCallback(async (email) => {
    return authApi.resetPassword(email)
  }, [])

  const value = useMemo(
    () => ({ user, loading, isDemo, demoLogin, signIn, signUp, signOut, resetPassword }),
    [user, loading, signIn, signUp, signOut, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
