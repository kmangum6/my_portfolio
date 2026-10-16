import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1><Link to="/helpdesk" style={{ color: 'inherit', textDecoration: 'none' }}>HelpDesk</Link></h1>
                <div>
                    <Link to="/">Back to Portfolio Home</Link>
                    {user.name} ({user.type}){' '}
                    <button onClick={logout}>Log out</button>
                </div>
            </header>
            {children}
        </div>
    );
}