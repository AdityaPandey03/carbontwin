import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authStore, authApi, AuthUser } from '../services/auth';

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, company?: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authStore.getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tok = authStore.getToken();
    if (!tok) {
      setLoading(false);
      return;
    }
    authApi.me(tok).then((u) => {
      if (u) {
        setUser(u);
        authStore.set(tok, u);
      } else {
        authStore.clear();
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login({ email, password });
    authStore.set(token, user);
    setUser(user);
  };

  const signup = async (name: string, email: string, password: string, company?: string) => {
    const { token, user } = await authApi.signup({ name, email, password, company });
    authStore.set(token, user);
    setUser(user);
  };

  const logout = () => {
    authStore.clear();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, login, signup, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
