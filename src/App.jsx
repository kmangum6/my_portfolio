import { Routes, Route } from 'react-router-dom'
import StartPage from './StartPage'
import { AuthProvider } from './helpdesk/AuthContext'
import ProtectedRoute from './helpdesk/ProtectedRoute'
import Login from './helpdesk/Login'
import TicketList from './helpdesk/TicketList';
import Layout from './helpdesk/Layout';
import TicketDetail from './helpdesk/TicketDetail';
import NewTicket from './helpdesk/CreateTicket';


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/helpdesk/login" element={<Login />} />
        <Route path="/helpdesk" element={<ProtectedRoute><Layout><TicketList /></Layout></ProtectedRoute>} />
        <Route path="/helpdesk/tickets/:id" element={<ProtectedRoute><Layout><TicketDetail /></Layout></ProtectedRoute>} />
        <Route path="/" element={<StartPage />} />
        <Route path="/helpdesk/tickets/new" element={<ProtectedRoute><Layout><NewTicket /></Layout></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  )
}