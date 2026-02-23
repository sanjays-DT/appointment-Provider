import axios from '../lib/axios';
import { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth";


export const loginProvider = async (payload: LoginPayload) => {
  const { data } = await axios.post<AuthResponse>(
    `/auth/login`,
    payload
  );
  return data;
};

export const registerProvider = async (payload: RegisterPayload) => {
  const { data } = await axios.post(
    `/providers/register`,
    payload
  );
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await axios.post(
    `/auth/forgot-password`,
    { email }
  );
  return data;
};

export const resetPassword = async (email: string, password: string) => {
  const { data } = await axios.post(
    `/auth/reset-password`,
    { email, password }
  );
  return data;
};
