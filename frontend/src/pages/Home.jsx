import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CIPHERS, favoritesService } from '../services/cipherService'
import { useAuth } from '../context/AuthContext'
import { 
  FaArrowLeft, FaCode, FaCircle, FaAsterisk, FaHashtag, FaWaveSquare, 
  FaRandom, FaSync, FaFont, FaUndo 
} from "react-icons/fa"
import { FaBarsStaggered, FaHeart, FaClockRotateLeft } from "react-icons/fa6"

const Home = () => {
  const { user } = useAuth()
  const [favoritesSet, setFavoritesSet] = useState(new Set())
  const [error, setError] = useState('')
  const [backendTest, setBackendTest] = useState(null)

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

  useEffect(() => {
    const testBackend = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/game/status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const json = await res.json()
        console.log('Backend test response:', json)
        setBackendTest(json.message)
      } catch (err) {
        console.error('Backend test failed:', err)
        setBackendTest('Failed to connect to backend')
      }
    }
    testBackend()
  }, [])

  const toggleFavorite = async (e, cipherType) => {
    e.preventDefault()
    e.stopPropagation()
    setError('')

    if (!user) {
      window.location.href = '/login'
      return
    }

    const isFav = favoritesSet.has(cipherType)
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
      setFavoritesSet(new Set(favoritesSet))
    }
  }

    const getCipherIcon = (cipherType) => {
    const cls = "w-12 h-8"; 

    const icons = {
      affine: <FaBarsStaggered className={cls} />,
      atbash: <FaArrowLeft className={cls} />,
      base64: <FaCode className={cls} />,
      binary: <FaCircle className={cls} />,
      caesar: <FaAsterisk className={cls} />,
      hex: <FaHashtag className={cls} />,
      morse: <FaWaveSquare className={cls} />,
      rail_fence: <FaRandom className={cls} />,
      rot13: <FaSync className={cls} />,
      vigenere: <FaFont className={cls} />,
      favorites: <FaHeart className={cls} />,
      history: <FaClockRotateLeft className={cls} />,
      default: <FaUndo className={cls} />
    }

    return icons[cipherType] || icons.default
  }


  const cipherCards = Object.entries(CIPHERS).map(([key, cipher]) => {
    const iconElement = getCipherIcon(key)

    return (
      <Link
        key={key}
        to={`/cipher/${key}`}
        className="legacy-card group relative overflow-hidden rounded-lg shadow-md p-2"
      >
        <span
          className="absolute inset-0 bg-blue-600 translate-x-full 
          group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"
        ></span>

        <div className="absolute top-1 right-1 z-20">
          <button
            onClick={(e) => toggleFavorite(e, key)}
            aria-label={favoritesSet.has(key) ? 'Remove favorite' : 'Add favorite'}
            className="p-1 rounded text-gray-800 hover:text-red-500 transition-colors duration-200"
          >
            <FaHeart
              className={`w-5 h-5 ${
                favoritesSet.has(key) ? 'text-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        <div className="legacy-card-icon relative z-10 group-hover:text-white transition-colors duration-300">
          {iconElement}
        </div>

        <div className="legacy-card-content pr-2 relative z-10 
             text-gray-800
             group-hover:text-white
             group-hover:[&_span]:text-white
             group-hover:[&_p]:text-white
             group-hover:[&_div]:text-white
             transition-colors duration-300">

          <h3 className="legacy-card-title flex items-center justify-between group-hover:text-white">
            <span>{cipher.name}</span>
          </h3>

          <p className="legacy-card-desc line-clamp-2 group-hover:text-white">
            {cipher.description}
          </p>

          {cipher.requiresKey && (
            <div className="text-xs text-blue-600 font-medium mt-1 group-hover:text-white transition-colors duration-300">
              Requires {cipher.keyType === 'number' ? 'numeric' : 'text'} key
            </div>
          )}
        </div>
      </Link>
    )
  })

  return (
    <div className="px-16 mx-auto w-full">
      <div className="text-center mb-6">
        <Link
          to="/game/minecipher"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Play Minecipher
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {cipherCards}
      </div>
    </div>
  )
}

export default Home
