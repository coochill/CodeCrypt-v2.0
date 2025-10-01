import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CIPHERS, favoritesService } from '../services/cipherService'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()
  const [favoritesSet, setFavoritesSet] = useState(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user) return setFavoritesSet(new Set())
      try {
        const res = await favoritesService.list()
        const set = new Set((res.favorites || []).map(f => f.cipher_type))
        setFavoritesSet(set)
      } catch (e) {
        console.warn('Failed to load favorites:', e)
        setError(e.message || 'Failed to load favorites')
      }
    }
    load()
  }, [user])

  const toggleFavorite = async (e, cipherType) => {
    // prevent Link navigation
    e.preventDefault()
    e.stopPropagation()
    setError('')

    if (!user) {
      // simple UX: send to login page
      window.location.href = '/login'
      return
    }

    const isFav = favoritesSet.has(cipherType)
    // optimistic update
    const newSet = new Set(favoritesSet)
    if (isFav) newSet.delete(cipherType)
    else newSet.add(cipherType)
    setFavoritesSet(newSet)

    try {
      if (isFav) await favoritesService.remove(cipherType)
      else await favoritesService.add(cipherType)
    } catch (err) {
      console.error('Favorite toggle failed:', err)
      setError(err.message || 'Favorite action failed')
      // rollback optimistic update
      const rollback = new Set(favoritesSet)
      setFavoritesSet(rollback)
    }
  }

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
      <Link key={key} to={`/cipher/${key}`} className="legacy-card group">
        {/* Favorite / bookmark button */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => toggleFavorite(e, key)}
            aria-label={favoritesSet.has(key) ? 'Remove favorite' : 'Add favorite'}
            className="p-1 rounded text-gray-400 hover:text-yellow-300"
          >
            {favoritesSet.has(key) ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927C9.324 2.01 10.676 2.01 10.951 2.927l.7 2.495a1 1 0 00.95.69h2.62c.969 0 1.371 1.24.588 1.81l-2.12 1.54a1 1 0 00-.364 1.118l.81 2.49c.275.917-.755 1.68-1.54 1.13L10 13.188l-2.694 1.44c-.785.55-1.815-.213-1.54-1.13l.81-2.49a1 1 0 00-.364-1.118L4.1 7.422c-.783-.57-.38-1.81.588-1.81h2.62a1 1 0 00.95-.69l.7-2.495z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        </div>

        <div className="legacy-card-icon">{iconConfig.icon}</div>

        <div className="legacy-card-content pr-4">
          <h3 className="legacy-card-title group-hover:text-white flex items-center justify-between">
            <span>{cipher.name}</span>
          </h3>
          <p className="legacy-card-desc line-clamp-2 group-hover:text-white/90">{cipher.description}</p>
          {cipher.requiresKey && (
            <div className="text-xs text-blue-600 font-medium mt-2">
              Requires {cipher.keyType === 'number' ? 'numeric' : 'text'} key
            </div>
          )}
        </div>
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
