"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@/types";
import { DEMO_CONFIG } from "@/lib/mock/config";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  demoLogin: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "her-demo-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as User;
      const nextUser =
        parsed.email === DEMO_CONFIG.user.email && parsed.id !== DEMO_CONFIG.user.id
          ? DEMO_CONFIG.user
          : parsed;
      setUser(nextUser);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    }
    setReady(true);
  }, []);

  const persistUser = useCallback((nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const matches =
        email.trim().toLowerCase() === DEMO_CONFIG.credentials.email &&
        password === DEMO_CONFIG.credentials.password;
      if (matches) persistUser(DEMO_CONFIG.user);
      return matches;
    },
    [persistUser],
  );

  const demoLogin = useCallback(async () => {
    persistUser(DEMO_CONFIG.user);
    return true;
  }, [persistUser]);

  const logout = useCallback(() => persistUser(null), [persistUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      demoLogin,
    }),
    [demoLogin, login, logout, user],
  );

  if (!ready) return <div className="min-h-screen bg-bg" />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
