import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bioEnabled, setBioEnabled] = useState(false);

  useEffect(() => {
    let alive = true;
    auth.restoreSession()
      .then((u) => alive && setUser(u))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!user) { setBioEnabled(false); return; }
    auth.isBiometricEnabledFor(user.email).then(setBioEnabled).catch(() => setBioEnabled(false));
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    bioEnabled,
    login: async (id, pw) => setUser(await auth.login(id, pw)),
    register: async (data) => setUser(await auth.register(data)),
    loginDemo: async () => setUser(await auth.loginDemo()),
    loginBiometric: async () => setUser(await auth.loginBiometric()),
    logout: async () => { await auth.logout(); setUser(null); },
    toggleBiometric: async (on) => {
      if (on) await auth.enableBiometric(user); else await auth.disableBiometric();
      setBioEnabled(on);
    },
  }), [user, loading, bioEnabled]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
