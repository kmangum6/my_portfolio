import { Routes, Route } from 'react-router-dom'
import StartPage from './StartPage'
import { AuthProvider, useAuth } from './helpdesk/AuthContext'
import ProtectedRoute from './helpdesk/ProtectedRoute'
import Login from './helpdesk/Login'
import TicketList from './helpdesk/TicketList';

function HelpdeskHome() {
  const { user, logout } = useAuth();
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Help Desk</h1>
        <div>
          {user.name} ({user.type}){' '}
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <TicketList />
    </div>
  );
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