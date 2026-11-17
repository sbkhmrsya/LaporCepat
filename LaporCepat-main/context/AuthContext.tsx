import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from '../services/authService';
import type { AuthUser, SessionResult, RegisterData } from '../services/authService';

const authAuthTest = auth.authTest;

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  bioEnabled: boolean;
  isAuthenticated: boolean;
  login: (id: string, pw: string) => Promise<any>;
  register: (data: RegisterData) => Promise<any>;
  loginDemo: () => Promise<any>;
  loginBiometric: () => Promise<any>;
  logout: () => Promise<void>;
  authTest: typeof authAuthTest;
  toggleBiometric: (on: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bioEnabled, setBioEnabled] = useState(false);

  useEffect(() => {
    let alive = true;
    auth.restoreSession()
      .then((u: SessionResult | null) => { if (alive) { setUser(u); setToken(u?.token ?? null); } })
      .catch(() => { if (alive) { setUser(null); setToken(null); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!user) { setBioEnabled(false); return; }
    auth.isBiometricEnabledFor(user.email).then(setBioEnabled).catch(() => setBioEnabled(false));
  }, [user]);

  const value: AuthContextValue = useMemo(() => ({
    user,
    token,
    loading,
    bioEnabled,
    isAuthenticated: !!user && !!token,
    login: async (id: string, pw: string) => { const r = await auth.login(id, pw); setUser(r.user || r); setToken(r.token); return r; },
    register: async (data: RegisterData) => { const r = await auth.register(data); setUser(r.user || r); setToken(r.token); return r; },
    loginDemo: async () => { const r = await auth.loginDemo(); setUser(r.user || r); setToken(r.token); return r; },
    loginBiometric: async () => { const r = await auth.loginBiometric(); setUser(r.user || r); setToken(r.token); return r; },
    logout: async () => { await auth.logout(); setUser(null); setToken(null); },
    authTest: authAuthTest,
    toggleBiometric: async (on: boolean) => {
      if (on) await auth.enableBiometric(user); else await auth.disableBiometric();
      setBioEnabled(on);
    },
  }), [user, token, loading, bioEnabled]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth dipakai di luar AuthProvider.');
  return ctx;
};
