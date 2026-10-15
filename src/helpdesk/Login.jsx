import { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import{ useAuth } from './AuthContext';

export default function Login() {
    const { login} = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function attempt(e,p) {
        setError('');
        setSubmitting(true);
        try {
            await login(e, p);
            navigate('/helpdesk');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleSubmit(ev) {
        ev.preventDefault();
        attempt(email, password);
    }

    return (
        <div style={{ maxWidth: 360, margin: '4rem auto' }}>
            <h1>Help Desk Login</h1>

            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                 </label>
                {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
                <button type="submit" disabled={submitting}>
                {submitting ? 'Logging in…' : 'Log in'}
                </button>
            </form>

            <hr />
            <p>Try the demo:</p>
            <button onClick={() => attempt('user@demo.com', 'demo1234')}>Customer</button>{' '}
            <button onClick={() => attempt('agent@demo.com', 'demo1234')}>Agent</button>{' '}
            <button onClick={() => attempt('admin@demo.com', 'demo1234')}>Admin</button>
        </div>
    )
}

