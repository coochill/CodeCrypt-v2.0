import { Link, useLocation } from 'react-router-dom'
import { CIPHERS } from '../services/cipherService'

const Sidebar = () => {
  const location = useLocation()
  
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
    <div className="legacy-sidebar">
      <div className="p-6 flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold">CC</span>
          </div>
          <span className="text-xl font-bold">CodeCrypt</span>
        </Link>
      </div>
      <nav className="legacy-nav-list">
        {Object.entries(CIPHERS).map(([key, cipher], idx) => (
          <Link
            key={key}
            to={`/cipher/${key}`}
            className={`legacy-nav-item ${isActive(`/cipher/${key}`) ? 'active' : ''}`}
          >
            <span className="legacy-nav-icon">{getCipherIcon(key)}</span>
            <span className="legacy-nav-label">{cipher.name}</span>
          </Link>
        ))}
        <Link to="/favorites" className={`legacy-nav-item ${isActive('/favorites') ? 'active' : ''}`}>
          <span className="legacy-nav-icon">⭐</span>
          <span className="legacy-nav-label">Favorites</span>
        </Link>
        <Link to="/profile" className={`legacy-nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <span className="legacy-nav-icon">📊</span>
            <span className="legacy-nav-label">History</span>
        </Link>
      </nav>
    </div>
  )
}

export default Sidebar
