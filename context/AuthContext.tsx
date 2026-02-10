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
import { getProvider as fetchProvider } from "@/services/providerService";

interface AuthContextType {
  provider: any;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (token: string, provider: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [provider, setProviderState] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  /* ================= INIT ================= */
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      const savedProvider = getProvider();

      const decoded: any = getDecodedToken();
      if (!token || !decoded?.exp || Date.now() >= decoded.exp * 1000) {
        logout();
        setIsInitializing(false);
        return;
      }

      if (savedProvider) {
        setProviderState(savedProvider);
      } else if (decoded?.id) {
        try {
          const providerData = await fetchProvider(decoded.id);
          setProvider(providerData);
          setProviderState(providerData);
        } catch {
          // If fetching provider fails, keep auth based on valid token
        }
      }

      setIsAuthenticated(true);
      setIsInitializing(false);
    };

    init();
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
      value={{ provider, isAuthenticated, isInitializing, login, logout }}
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
