import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CIPHERS, favoritesService } from '../services/cipherService'
import { useAuth } from '../context/AuthContext'

// Placeholder: In a full implementation favorites would come from API/user profile
const Favorites = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const loadFavorites = async () => {
    setLoading(true)
    setError('')
    try {
      if (user) {
        const res = await favoritesService.list()
        // Map into cipher metadata
        const mapped = res.favorites.map(f => ({ cipher_type: f.cipher_type, meta: CIPHERS[f.cipher_type] }))
        setFavorites(mapped)
      } else {
        // Not logged in: show empty (could fallback to local storage later)
        setFavorites([])
      }
    } catch (e) {
      setError(e.message || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFavorites() }, [user])

  const handleAdd = async (cipherType) => {
    try {
      await favoritesService.add(cipherType)
      loadFavorites()
    } catch (e) {
      setError(e.message || 'Add failed')
    }
  }

  const handleRemove = async (cipherType) => {
    try {
      await favoritesService.remove(cipherType)
      loadFavorites()
    } catch (e) {
      setError(e.message || 'Remove failed')
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="legacy-section-title">Your Favorites</h1>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-500">Loading favorites...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>
      )}

      {!loading && favorites.length === 0 && (
        <div className="text-center py-20">
          {user ? (
            <>
              <p className="text-gray-600 text-lg">You haven't added any favorites yet.</p>
              <Link to="/" className="btn btn-primary mt-6">Browse Ciphers</Link>
            </>
          ) : (
            <p className="text-gray-600 text-lg">Log in to save favorites.</p>
          )}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="legacy-card-grid">
          {favorites.map(fav => {
            const meta = fav.meta
            return (
              <div key={fav.cipher_type} className="legacy-card group">
                <div className="legacy-card-icon">🔒</div>
                <div className="legacy-card-content pr-4">
                  <h3 className="legacy-card-title group-hover:text-white flex items-center justify-between">
                    <span>{meta?.name || fav.cipher_type}</span>
                  </h3>
                  <p className="legacy-card-desc line-clamp-2 group-hover:text-white/90">{meta?.description}</p>
                </div>
                {user && (
                  <div className="relative z-10 flex flex-col gap-2">
                    <Link to={`/cipher/${fav.cipher_type}`} className="btn btn-secondary text-xs">Open</Link>
                    <button onClick={() => handleRemove(fav.cipher_type)} className="btn btn-danger text-xs">Remove</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {user && (
        <div className="mt-14">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Favorite</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(CIPHERS).filter(([key]) => !favorites.find(f => f.cipher_type === key)).map(([key, meta]) => (
              <button key={key} onClick={() => handleAdd(key)} className="legacy-card group !p-4 flex-col items-start">
                <div className="legacy-card-title group-hover:text-white text-base mb-1">{meta.name}</div>
                <div className="legacy-card-desc group-hover:text-white/90 line-clamp-2 text-xs">{meta.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Favorites
