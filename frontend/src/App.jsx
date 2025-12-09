import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CipherPage from './pages/CipherPage'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import Game from './pages/Game'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AITutorWidget from './components/AITutorWidget'



function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cipher/:type" element={<CipherPage />} />
            <Route path="/game/minecipher" element={<ProtectedRoute><Game /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Profile defaultTab="profile" /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><Profile defaultTab="history" /></ProtectedRoute>} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
        <AITutorWidget />
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
