import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../images/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Mock login for demo
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Login successful")
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex justify-center items-center p-4 md:p-8">
        
        {/* Left Column: Login Form */}
        <div className="w-full lg:w-5/12 p-12 flex flex-col justify-center">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-10">
            <div className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center">
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 object-contain transition-all duration-300"
              />
            </div>
            <span className="text-2xl font-bold text-blue-600">CodeCrypt</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Login</h2>
          <p className="text-4xl font-light text-gray-800 mb-6">Hey, Hello</p>
          <p className="text-sm text-gray-500 mb-6">
            Enter the information you entered while registering.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                Email or Username:
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-blue-400 mt-6"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center space-y-1 text-sm">
            <p className="text-gray-600">
              Forgot your password?{' '}
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Click here
              </Link>
            </p>
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Gradient Background */}
        <div className="  pt-[180px] pr-[300px] pb-[180px] pl-[300px] relative 
                        bg-gradient-to-br from-blue-100 via-blue-400 to-blue-700 
                        flex items-center justify-center">
          <div className="p-10 rounded-xl bg-white/20 backdrop-blur-md shadow-2xl text-center 
                          w-96 h-64 flex flex-col justify-center items-center transform scale-95">
            <h3 className="text-2xl font-bold text-white mb-4">
              Digital platform for <br /> encrypting and decrypting.
            </h3>
            <p className="text-sm font-light text-white opacity-90">
              Encrypt It, Decrypt It, <br /> Keep It Safe with CodeCrypt
            </p>
          </div>
        </div>
      </div>
  
  )
}

export default Login
