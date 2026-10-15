import { createContext, useContext, useEffect, useState } from 'react';
import {api } from './api';

const AuthContext = creatContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoadint] = useState(true);

    // Check Login
    useEffect(() => {
    api('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const u = await api('/auth/login', { method: 'POST', body: { email, password } });
    setser(u);
    return u;
  };

  const logout = async () => {
    await api('/auth/logout', { method : 'POST' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loutout}}>
        {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);