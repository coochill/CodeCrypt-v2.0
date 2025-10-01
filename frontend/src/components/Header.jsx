import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { CIPHERS } from '../services/cipherService'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="text-xl font-bold text-gray-800">CodeCrypt</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Profile
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Welcome, {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 hover:text-blue-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation / Backdrop */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            <div id="mobile-menu" className="md:hidden fixed top-0 right-0 z-50 w-full max-w-xs bg-white h-full shadow-lg transform transition-transform duration-200"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CC</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">CodeCrypt</span>
                </Link>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-gray-800" aria-label="Close menu">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <Link to="/" className="block text-gray-700 hover:text-blue-600 text-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>

                <div className="pt-2 border-t border-gray-100" />

                <div className="space-y-1">
                  {Object.entries(CIPHERS).map(([key, meta]) => (
                    <Link key={key} to={`/cipher/${key}`} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>
                      <span className="w-7 h-7 rounded bg-white/20 flex items-center justify-center">{(() => {
                        const icons = {
                          affine: '📐', atbash: '🔄', base64: '</>', binary: '0️⃣', caesar: '🔤', hex: '#️⃣', morse: '📡', rail_fence: '🚂', rot13: '🔄', vigenere: '🔑'
                        }
                        return icons[key] || '🔒'
                      })()}</span>
                      <span className="text-gray-700">{meta.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100" />

                {user ? (
                  <>
                    <Link to="/profile" className="block text-gray-700 hover:text-blue-600 text-lg" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                    <div className="text-sm text-gray-500">Welcome, {user.username}</div>
                    <button onClick={handleLogout} className="btn btn-secondary w-full">Logout</button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link to="/login" className="btn btn-secondary w-full" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    <Link to="/register" className="btn btn-primary w-full" onClick={() => setIsMenuOpen(false)}>Register</Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
