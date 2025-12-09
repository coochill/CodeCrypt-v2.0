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
    <div className="w-full">

      {/* Header Bar */}
      <div className="px-6 py-4 bg-transparent">
        <div className="flex items-center justify-between">

          {/* Left side empty */}
          <div></div>

          {/* User Details */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Welcome back!</p>
                  <p className="text-xs font-medium text-gray-900">{user.email}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-blue-600 text-white text-sm px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="bg-gray-300 text-gray-900 text-sm px-5 py-2 rounded-full font-medium hover:bg-gray-400 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-600 text-white text-sm px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Greeting — CENTERED BELOW HEADER */}
      <div className="flex justify-start mt-8 ml-24">
        <div
          className="
            bg-blue-600 
            text-white 
            px-5 
            py-2 
            rounded-full 
            shadow-md 
            text-sm 
            font-semibold
          "
        >
          {user ? (
            <>Hi, {user.username}! What do you want to convert today?</>
          ) : (
            <>{getGreeting()}! What do you want to convert today?</>
          )}
        </div>
      </div>

    </div>
  )
}

export default TopBar
