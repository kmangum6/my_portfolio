import { Routes, Route } from 'react-router-dom'
import StartPage from './StartPage'
import { AuthProvider, useAuth } from './helpdesk/AuthContext'
import ProtectedRoute from './helpdesk/ProtectedRoute'
import Login from './helpdesk/Login'

// Temporary placeholder until we build the ticket list
function HelpdeskHome() {
  const { user, logout } = useAuth()
  return (
    <div>
      <p>Logged in as {user.name} ({user.type})</p>
      <button onClick={logout}>Log out</button>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Portfolio home page */}
        <Route path="/" element={<StartPage />} />

        {/* Helpdesk project */}
        <Route path="/helpdesk/login" element={<Login />} />
        <Route
          path="/helpdesk"
          element={
            <ProtectedRoute>
              <HelpdeskHome />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}