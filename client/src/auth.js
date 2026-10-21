import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('token')) return setReady(true);
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setReady(true));
  }, []);
  const save = ({ token, user }) => { localStorage.setItem('token', token); setUser(user); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  return <Ctx.Provider value={{ user, ready, save, logout }}>{children}</Ctx.Provider>;
}
