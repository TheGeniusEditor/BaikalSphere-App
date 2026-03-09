"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, refreshAccessToken, getMe, setAccessToken } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  fullName: string;
  platformRole: string;
  organizationId: string | null;
  modules: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, organizationName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount (via refresh token cookie)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await refreshAccessToken();
        if (token) {
          const profile = await getMe();
          setUser({
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            platformRole: profile.platformRole,
            organizationId: profile.organizationId,
            modules: profile.modules,
          });
        }
      } catch {
        // No valid session
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin({ email, password });
    setUser({
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      platformRole: data.user.platformRole,
      organizationId: data.user.organizationId,
      modules: data.user.modules || [],
    });
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, organizationName?: string) => {
    const data = await apiRegister({ email, password, fullName, organizationName });
    setUser({
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.fullName,
      platformRole: data.user.platformRole,
      organizationId: data.user.organizationId,
      modules: data.user.modules || [],
    });
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
