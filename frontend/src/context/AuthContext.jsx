import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('codecrypt_current_user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        localStorage.removeItem('token')
        localStorage.removeItem('codecrypt_current_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      localStorage.setItem('token', response.token)
      localStorage.setItem('codecrypt_current_user', JSON.stringify(response.user))
      return response
    } catch (error) {
      const errorObj = new Error(error.message || 'Login failed')
      errorObj.response = { data: { message: error.message } }
      throw errorObj
    }
  }

  const register = async (username, email, password) => {
    try {
      const response = await authService.register(username, email, password)
      setUser(response.user)
      localStorage.setItem('token', response.token)
      localStorage.setItem('codecrypt_current_user', JSON.stringify(response.user))
      return response
    } catch (error) {
      const errorObj = new Error(error.message || 'Registration failed')
      errorObj.response = { data: { message: error.message } }
      throw errorObj
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('codecrypt_current_user')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
