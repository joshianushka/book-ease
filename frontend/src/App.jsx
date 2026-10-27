import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import api from './api'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PublicBooking from './pages/PublicBooking'

function Protected({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let active = true

    api.get('/services')
      .then(() => {
        if (active) setStatus('authenticated')
      })
      .catch((error) => {
        if (!active) return

        if (error.response?.status === 401) {
          setStatus('unauthenticated')
        } else {
          setStatus('error')
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (status === 'checking') return <p>Checking your session...</p>
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  if (status === 'error') return <p>Could not verify your session. Please try again.</p>

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/b/:slug" element={<PublicBooking />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}