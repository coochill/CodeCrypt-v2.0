import { Link } from 'react-router-dom'
import { CIPHERS } from '../services/cipherService'

const Home = () => {
  const getCipherIcon = (cipherType) => {
    const iconMap = {
      affine: {
        icon: '📐',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-600'
      },
      atbash: {
        icon: '🔄',
        bgColor: 'bg-green-500', 
        textColor: 'text-green-600'
      },
      base64: {
        icon: '</>',
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-600'
      },
      binary: {
        icon: '●',
        bgColor: 'bg-gray-500',
        textColor: 'text-gray-600'
      },
      caesar: {
        icon: '❄',
        bgColor: 'bg-blue-500',
        textColor: 'text-blue-600'
      },
      hex: {
        icon: '#',
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-600'
      },
      morse: {
        icon: '📡',
        bgColor: 'bg-indigo-500',
        textColor: 'text-indigo-600'
      },
      rail_fence: {
        icon: '🚂',
        bgColor: 'bg-red-500',
        textColor: 'text-red-600'
      },
      rot13: {
        icon: '🔄',
        bgColor: 'bg-teal-500',
        textColor: 'text-teal-600'
      },
      vigenere: {
        icon: 'A',
        bgColor: 'bg-pink-500',
        textColor: 'text-pink-600'
      }
    }
    return iconMap[cipherType] || {
      icon: '🔒',
      bgColor: 'bg-gray-500',
      textColor: 'text-gray-600'
    }
  }

  const cipherCards = Object.entries(CIPHERS).map(([key, cipher]) => {
    const iconConfig = getCipherIcon(key)
    
    return (
      <Link
        key={key}
        to={`/cipher/${key}`}
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 group relative overflow-hidden"
      >
        {/* Bookmark Icon */}
        <div className="absolute top-4 right-4">
          <svg className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>

        {/* Icon */}
        <div className={`w-12 h-12 ${iconConfig.bgColor} rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4`}>
          {iconConfig.icon}
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {cipher.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {cipher.description}
        </p>

        {/* Key requirement indicator */}
        {cipher.requiresKey && (
          <div className="text-xs text-blue-600 font-medium">
            Requires {cipher.keyType === 'number' ? 'numeric' : 'text'} key
          </div>
        )}
      </Link>
    )
  })

  return (
    <div>
      {/* Cipher Grid - matching the layout from your screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cipherCards}
      </div>
    </div>
  )
}

export default Home
