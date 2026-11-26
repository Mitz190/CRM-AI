import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the cookie on first load.
  useEffect(() => {
    authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  // api.js fires this when any request comes back 401.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (credentials) => setUser(await authApi.login(credentials)), []);
  const register = useCallback(async (data) => setUser(await authApi.register(data)), []);
  const resetPassword = useCallback(async (token, password) => setUser(await authApi.resetPassword(token, password)), []);
  const logout = useCallback(async () => {
    try { await authApi.logout(); } finally { setUser(null); }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, resetPassword, logout, setUser }),
    [user, loading, login, register, resetPassword, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}