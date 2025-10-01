import { Link, useLocation } from 'react-router-dom'
import { CIPHERS } from '../services/cipherService'
import { useState, useEffect } from 'react'

const Sidebar = () => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebarCollapsed')
      if (stored !== null) setCollapsed(stored === 'true')
    } catch (e) {
      // ignore
    }
  }, [])

  const setAndStore = (val) => {
    setCollapsed(val)
    try { localStorage.setItem('sidebarCollapsed', val ? 'true' : 'false') } catch (e) {}
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const getCipherIcon = (cipherType) => {
    const icons = {
      affine: '📐',
      atbash: '🔄',
      base64: '</>', 
      binary: '0️⃣',
      caesar: '🔤',
      hex: '#️⃣',
      morse: '📡',
      rail_fence: '🚂',
      rot13: '🔄',
      vigenere: '🔑'
    }
    return icons[cipherType] || '🔒'
  }

  return (
    <div className={`legacy-sidebar ${collapsed ? 'narrow' : ''}`}>
      <div className="p-6 flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold">CC</span>
          </div>
          <span className={`text-xl font-bold ${collapsed ? 'collapse-hide' : ''}`}>CodeCrypt</span>
        </Link>

        {/* Collapse toggle button */}
        <button
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="legacy-sidebar-toggle"
          onClick={() => setAndStore(!collapsed)}
          aria-pressed={collapsed}
        >
          {collapsed ? '»' : '≡'}
        </button>
      </div>
      <nav className="legacy-nav-list">
        {Object.entries(CIPHERS).map(([key, cipher], idx) => (
          <Link
            key={key}
            to={`/cipher/${key}`}
            className={`legacy-nav-item ${isActive(`/cipher/${key}`) ? 'active' : ''}`}
          >
            <span className="legacy-nav-icon">{getCipherIcon(key)}</span>
            <span className={`legacy-nav-label ${collapsed ? 'collapse-hide' : ''}`}>{cipher.name}</span>
          </Link>
        ))}
        <Link to="/favorites" className={`legacy-nav-item ${isActive('/favorites') ? 'active' : ''}`}>
          <span className="legacy-nav-icon">⭐</span>
          <span className={`legacy-nav-label ${collapsed ? 'collapse-hide' : ''}`}>Favorites</span>
        </Link>
        <Link to="/profile" className={`legacy-nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <span className="legacy-nav-icon">📊</span>
            <span className={`legacy-nav-label ${collapsed ? 'collapse-hide' : ''}`}>History</span>
        </Link>
      </nav>
    </div>
  )
}

export default Sidebar
