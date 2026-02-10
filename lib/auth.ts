// lib/auth.ts
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "provider_token";
const PROVIDER_KEY = "provider_data";

/* ================= TOKEN ================= */

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROVIDER_KEY);
};

/* ================= PROVIDER ================= */

export const setProvider = (provider: any) => {
  if (typeof window === "undefined") return;
  if (provider === undefined || provider === null) {
    localStorage.removeItem(PROVIDER_KEY);
    return;
  }
  localStorage.setItem(PROVIDER_KEY, JSON.stringify(provider));
};

export const getProvider = () => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(PROVIDER_KEY);
  if (!data || data === "undefined" || data === "null") return null;
  try {
    return JSON.parse(data);
  } catch {
    localStorage.removeItem(PROVIDER_KEY);
    return null;
  }
};

/* ================= JWT ================= */

export const getDecodedToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<{ id: string; role: string }>(token);
  } catch {
    return null;
  }
};

export const isProviderAuthenticated = () => {
  const decoded = getDecodedToken();
  return decoded?.role === "provider";
};

export const isTokenExpired = () => {
  const decoded: any = getDecodedToken();
  if (!decoded?.exp) return true;

  return Date.now() >= decoded.exp * 1000;
};

