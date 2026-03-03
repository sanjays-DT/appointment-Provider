import axios from '../lib/axios'; // your configured axios instance

interface AppointmentData {
  providerId?: string;
  start?: string;
  end?: string;
  user?: string; // optional, for admin creating bookings
  timezone?: string;  
}

export interface RescheduleData {
  start: string;
  end: string;
  timezone: string;  // Add timezone
}

//Get user's timezone helper
const getUserTimezone = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'UTC'; // Fallback for server-side rendering
};

// Get provider appointments WITH timezone
export const getProviderAppointments = async (id: string) => {
  const timezone = getUserTimezone();
  return await axios.get(`/appointment/${id}`, {
    params: { timezone } // Send timezone as query param
  });
};

// Create appointment WITH timezone
export const createAppointment = async (data: AppointmentData) => {
  const timezone = getUserTimezone();
  return await axios.post('/appointment', {
    ...data,
    timezone // Add timezone to request body
  });
};

// Cancel appointment (no timezone needed for cancel)
export const cancelAppointment = async (id: string) => {
  return await axios.put(`/appointment/${id}/cancel`);
};

// Reschedule appointment WITH timezone
export const rescheduleAppointment = async (
  id: string, 
  data: RescheduleData  // Now includes timezone
) => {
  return await axios.put(`/appointment/${id}/reschedule`, data);
};

//Get all appointments (admin) WITH timezone
export const getAllAppointments = async () => {
  const timezone = getUserTimezone();
  return await axios.get('/admin/appointments', {
    params: { timezone }
  });
};

//Approve appointment (no timezone needed)
export const approveAppointment = async (id: string) => {
  return await axios.put(`/appointment/${id}/approve`);
};

//Reject appointment (no timezone needed)
export const rejectAppointment = async (id: string) => {
  return await axios.put(`/appointment/${id}/reject`);
};