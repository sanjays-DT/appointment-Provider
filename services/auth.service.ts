import axios from "axios";
import { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth";
const API_URL = "http://localhost:5000/api/providers/auth";

export const loginProvider = async (payload: LoginPayload) => {
  const { data } = await axios.post<AuthResponse>(
    `http://localhost:5000/api/auth/login`,
    payload
  );
  return data;
};

export const registerProvider = async (payload: RegisterPayload) => {
  const { data } = await axios.post(
    `${API_URL}/register`,
    payload
  );
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await axios.post(
    `${API_URL}/forgot-password`,
    { email }
  );
  return data;
};

export const resetPassword = async (email: string, password: string) => {
  const { data } = await axios.post(
    `${API_URL}/reset-password`,
    { email, password }
  );
  return data;
};
