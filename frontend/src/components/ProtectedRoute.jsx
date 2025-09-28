import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Usage: <ProtectedRoute><Profile /></ProtectedRoute>
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
