"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, tokenStore, getErrorMessage } from "@/lib/api";
import { getDeviceId } from "@/lib/deviceId";
import { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = tokenStore.getAccess();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password }, { headers: { "X-Device-Id": getDeviceId() } });
    tokenStore.set(data.data.accessToken, data.data.refreshToken);
    setUser(data.data.user);
    router.push(data.data.user.role === "admin" ? "/admin" : "/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post("/auth/register", { name, email, password });
    router.push("/login?registered=true");
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    }
    tokenStore.clear();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { getErrorMessage };
