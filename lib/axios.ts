import axios from "axios";
import { getToken } from "@/lib/auth";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
export const BASE_URL =  NEXT_PUBLIC_API_BASE_URL;

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token =
    getToken() ||
    (typeof window !== "undefined" ? localStorage.getItem("provider_token") : null);
  if (token) {
    (config.headers as any) = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

export default instance;
