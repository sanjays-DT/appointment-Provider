import axios from "../lib/axios";
import { Provider } from "../types/provider";


export const getProviders = async (): Promise<Provider[]> => {
  const res = await axios.get('/providers');
  return res.data;
};

export const getProvider = async (id: string): Promise<Provider> => {
  const res = await axios.get(`/providers/${id}`);
  return res.data;
};

export const createProvider = async (data: FormData) => {
  return await axios.post("/providers", data);
};

export const updateProvider = async (id: string, data: FormData) => {
  return await axios.put(`/providers/${id}`,data);
};

export const getProviderAvatarURL = (id: string, baseURL: string) => {
  return `${baseURL}/providers/${id}/avatar`;
};

export const deleteProvider = async (id: string): Promise<void> => {
  await axios.delete(`/providers/${id}`);
};

export const getProviderDashboardData = (id: string) => {
  return `/providers/${id}/dashboard-stats`;
};
