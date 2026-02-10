import api from '@/lib/axios';

export const getNotifications = () => api.get('/notifications');
export const markAsRead = (id: string) => api.put(`/notifications/${id}/read`);
export const deleteNotification = (id: string) => api.delete(`/notifications/${id}`);
export const deleteAllNotifications = () => api.delete('/notifications');
export const markAllAsRead = () => api.put('/notifications/read-all');
