import { Link, useLocation } from 'react-router-dom';
import { CIPHERS } from '../services/cipherService';
import { useState, useEffect } from 'react';
import { 
  FaArrowLeft, FaCode, FaCircle, FaAsterisk, FaHashtag, FaWaveSquare, 
  FaRandom, FaSync, FaFont, FaUndo, FaCog 
} from "react-icons/fa";
import { FaBarsStaggered, FaHeart } from "react-icons/fa6";
import logo from '../images/logo2.png';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const COLLAPSE_WIDTH = 768; // px
  const sidebarBlue = '#1D4ED8'; // sidebar active color

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebarCollapsed');
      if (stored !== null) setCollapsed(stored === 'true');
    } catch (e) {}

    const handleResize = () => {
      if (window.innerWidth < COLLAPSE_WIDTH) {
        setCollapsed(true);
      } else {
        try {
          const stored = localStorage.getItem('sidebarCollapsed');
          if (stored !== null) setCollapsed(stored === 'true');
        } catch (e) {}
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setAndStore = (val) => {
    setCollapsed(val);
    try { 
      localStorage.setItem('sidebarCollapsed', val ? 'true' : 'false'); 
    } catch (e) {}
  };

  const isActive = (path) => location.pathname === path;

  const getCipherIcon = (cipherType, active) => {
    const color = active ? sidebarBlue : 'white';
    const icons = {
      affine: <FaBarsStaggered color={color} />,
      atbash: <FaArrowLeft color={color} />,
      base64: <FaCode color={color} />,
      binary: <FaCircle color={color} />,
      caesar: <FaAsterisk color={color} />,
      hex: <FaHashtag color={color} />,
      morse: <FaWaveSquare color={color} />,
      rail_fence: <FaRandom color={color} />,
      rot13: <FaSync color={color} />,
      vigenere: <FaFont color={color} />,
      favorites: <FaHeart color={color} />,
      settings: <FaCog color={color} />,
      default: <FaUndo color={color} />
    };
    return icons[cipherType] || icons.default;
  };

  return (
    <div className={`legacy-sidebar ${collapsed ? 'narrow' : ''} h-screen`}>
      {/* Zoomed out content wrapper */}
      <div className="transform scale-96 origin-top-left h-full w-full">

        {/* Logo */}
        <div className="p-6 flex items-center justify-start">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src={logo}
                alt="Logo"
                className={`w-full h-full object-contain transition-all duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}
              />
            </div>
            <span
              className={`text-xl font-bold transition-all duration-300 whitespace-nowrap ${
                collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              CodeCrypt
            </span>
          </Link>
        </div>

        {/* Navigation + Toggle */}
        <div className="flex flex-col justify-between h-full">
          <nav className="legacy-nav-list flex-1">
            {Object.entries(CIPHERS).map(([key, cipher]) => {
              const active = isActive(`/cipher/${key}`);
              return (
                <Link
                  key={key}
                  to={`/cipher/${key}`}
                  className={`legacy-nav-item ${active ? 'active' : ''}`}
                >
                  <span className="legacy-nav-icon">{getCipherIcon(key, active)}</span>
                  <span
                    className={`legacy-nav-label transition-all duration-300 ${
                      collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}
                  >
                    {cipher.name}
                  </span>
                </Link>
              );
            })}

            <Link to="/favorites" className={`legacy-nav-item ${isActive('/favorites') ? 'active' : ''}`}>
              <span className="legacy-nav-icon">{getCipherIcon('favorites', isActive('/favorites'))}</span>
              <span
                className={`legacy-nav-label transition-all duration-300 ${
                  collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                Favorites
              </span>
            </Link>

            <Link to="/settings" className={`legacy-nav-item ${isActive('/settings') ? 'active' : ''}`}>
              <span className="legacy-nav-icon">{getCipherIcon('settings', isActive('/settings'))}</span>
              <span
                className={`legacy-nav-label transition-all duration-300 ${
                  collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                Settings
              </span>
            </Link>
          </nav>

          {/* Toggle centered at bottom when collapsed */}
          <div className="p-4 flex justify-center">
            <button
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="legacy-sidebar-toggle"
              onClick={() => setAndStore(!collapsed)}
              aria-pressed={collapsed}
            >
              {collapsed ? '≡' : '»'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
