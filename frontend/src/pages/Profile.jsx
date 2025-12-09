import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cipherService } from '../services/cipherService'
import { authService } from '../services/authService'
import { Navigate } from 'react-router-dom'

const Profile = ({ defaultTab = 'profile' }) => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Profile form state
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      })
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchHistory()
    }
  }, [activeTab, user])

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  if (!user) {
    return <Navigate to="/login" />
  }

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await cipherService.getHistory()
      setHistory(response.history || [])
    } catch (err) {
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await authService.updateProfile(profileData)
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword)
      setSuccess('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHistoryItem = async (id) => {
    try {
      await cipherService.deleteHistoryItem(id)
      setHistory(history.filter(item => item.id !== id))
      setSuccess('History item deleted')
    } catch (err) {
      setError('Failed to delete history item')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account settings and view your cipher history</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cipher History
          </button>
        </nav>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Profile Information</h2>
          </div>
          <div className="card-content">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Change Password</h2>
          </div>
          <div className="card-content">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cipher History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Cipher History</h2>
            <p className="card-description">Your recent cipher operations</p>
          </div>
          <div className="card-content">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading history...</div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No cipher history found</div>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-gray-900">{item.cipher_type}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          item.operation === 'encode' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.operation}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(item.timestamp)}
                        </span>
                        <button
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">Input:</div>
                        <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all">
                          {item.input_text}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Output:</div>
                        <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all">
                          {item.output_text}
                        </div>
                      </div>
                    </div>
                    {item.key && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Key:</span>
                        <span className="ml-2 font-mono">{item.key}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
