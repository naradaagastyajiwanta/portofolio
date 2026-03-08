"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface User {
  id: string;
  username: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Schedule token refresh 1 minute before expiry
  const scheduleRefresh = useCallback((expiresIn: number) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const refreshMs = Math.max((expiresIn - 60) * 1000, 10000); // at least 10s
    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken();
    }, refreshMs);
  }, []);

  // Refresh access token using httpOnly cookie
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        setAccessToken(null);
        return null;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      setUser(data.user);
      scheduleRefresh(data.expiresIn);
      return data.accessToken;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, [scheduleRefresh]);

  // On mount try to refresh existing session
  useEffect(() => {
    refreshAccessToken().finally(() => setIsLoading(false));
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [refreshAccessToken]);

  // Get valid access token (refresh if needed)
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (accessToken) return accessToken;
    return refreshAccessToken();
  }, [accessToken, refreshAccessToken]);

  // Fetch wrapper that auto-injects Authorization header
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = await getAccessToken();

    const makeRequest = (t: string | null) =>
      fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options.headers,
          ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
      });

    let res = await makeRequest(token);

    // If 401, try refresh once and retry
    if (res.status === 401 && token) {
      token = await refreshAccessToken();
      if (token) {
        res = await makeRequest(token);
      }
    }

    return res;
  }, [getAccessToken, refreshAccessToken]);

  // Login
  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      scheduleRefresh(data.expiresIn);
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error. Is the backend running?" };
    }
  }, [scheduleRefresh]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch { /* ignore */ }

    setUser(null);
    setAccessToken(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  // Logout all sessions
  const logoutAll = useCallback(async () => {
    try {
      await authFetch(`${API_URL}/api/auth/logout-all`, { method: "POST" });
    } catch { /* ignore */ }

    setUser(null);
    setAccessToken(null);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, [authFetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        logoutAll,
        getAccessToken,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
