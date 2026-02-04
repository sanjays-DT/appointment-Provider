"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  getProvider,
  setToken,
  setProvider,
  removeToken,
  getDecodedToken,
} from "@/lib/auth";

interface AuthContextType {
  provider: any;
  isAuthenticated: boolean;
  login: (token: string, provider: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [provider, setProviderState] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    const token = getToken();
    const savedProvider = getProvider();

    if (!token || !savedProvider) {
      logout();
      return;
    }

    const decoded: any = getDecodedToken();
    if (!decoded?.exp || Date.now() >= decoded.exp * 1000) {
      logout();
      return;
    }

    setProviderState(savedProvider);
    setIsAuthenticated(true);
  }, []);

  /* ================= LOGIN ================= */
  const login = (token: string, providerData: any) => {
    setToken(token);
    setProvider(providerData);

    setProviderState(providerData);
    setIsAuthenticated(true);
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    removeToken();
    setProviderState(null);
    setIsAuthenticated(false);
    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{ provider, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
