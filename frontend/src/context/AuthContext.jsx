import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('pm_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem('pm_user')
      localStorage.removeItem('pm_token')
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pm_token')
    if (token) {
      authAPI.getMe()
        .then(data => { setUser(data); localStorage.setItem('pm_user', JSON.stringify(data)) })
        .catch(() => { localStorage.removeItem('pm_token'); localStorage.removeItem('pm_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (data) => {
    const res = await authAPI.login(data)
    localStorage.setItem('pm_token', res.token)
    localStorage.setItem('pm_user', JSON.stringify(res.user))
    setUser(res.user)
    return res
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    localStorage.setItem('pm_token', res.token)
    localStorage.setItem('pm_user', JSON.stringify(res.user))
    setUser(res.user)
    return res
  }

  const logout = () => {
    localStorage.removeItem('pm_token')
    localStorage.removeItem('pm_user')
    setUser(null)
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('pm_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
