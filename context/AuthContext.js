import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bioEnabled, setBioEnabled] = useState(false);

  useEffect(() => {
    let alive = true;
    auth.restoreSession()
      .then((u) => { if (alive) { setUser(u.user || u); setToken(u.token || null); } })
      .catch(() => { if (alive) { setUser(null); setToken(null); } })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!user) { setBioEnabled(false); return; }
    auth.isBiometricEnabledFor(user.email).then(setBioEnabled).catch(() => setBioEnabled(false));
  }, [user]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    bioEnabled,
    isAuthenticated: !!user && !!token,
    login: async (id, pw) => { const r = await auth.login(id, pw); setUser(r.user || r); setToken(r.token); return r; },
    register: async (data) => { const r = await auth.register(data); setUser(r.user || r); setToken(r.token); return r; },
    loginDemo: async () => { const r = await auth.loginDemo(); setUser(r.user || r); setToken(r.token); return r; },
    loginBiometric: async () => { const r = await auth.loginBiometric(); setUser(r.user || r); setToken(r.token); return r; },
    logout: async () => { await auth.logout(); setUser(null); setToken(null); },
    authTest: auth.authTest,
    toggleBiometric: async (on) => {
      if (on) await auth.enableBiometric(user); else await auth.disableBiometric();
      setBioEnabled(on);
    },
  }), [user, token, loading, bioEnabled]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
