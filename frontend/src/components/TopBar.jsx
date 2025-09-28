import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const TopBar = () => {
  const { user, logout } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user ? (
              <>
                Hi, {user.username}! What do you want to convert today?
              </>
            ) : (
              <>
                {getGreeting()}! What do you want to convert today?
              </>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Choose a cipher from the sidebar to get started with encoding and decoding.
          </p>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back!</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopBar
