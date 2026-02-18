'use client';

import { useEffect, useState } from 'react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '@/services/notificationService';
import { toast } from 'react-toastify';
import { Check, Trash2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsTable() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { setNotifications: setGlobalNotifications } = useNotifications();

  const syncState = (list: Notification[]) => {
    setNotifications(list);
    setGlobalNotifications(list);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      const list =
        res.data?.notifications ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      syncState(list);
    } catch {
      toast.error('Failed to load notifications');
      syncState([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast.success('Notification marked as read');
      syncState(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
      syncState(notifications.map(n => ({ ...n, read: true })));
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
      syncState(notifications.filter(n => n._id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    try {
      await deleteAllNotifications();
      toast.success('All notifications cleared');
      syncState([]);
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-full mx-auto rounded-2xl border p-4 sm:p-6 overflow-x-auto shadow-sm bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-900 dark:text-gray-300">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleMarkAllRead}
              className="bg-green-500 hover:bg-green-600 p-2 rounded-md text-white flex items-center justify-center"
              title="Mark All Read"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600 p-2 rounded-md text-white flex items-center justify-center"
              title="Clear All"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10 text-lg text-gray-500 dark:text-gray-300">
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (
          <p className="text-center py-10 text-lg text-gray-500 dark:text-gray-300">
            No notifications found
          </p>
        ) : (
          <table className="min-w-[700px] w-full divide-y divide-gray-200 dark:divide-neutral-700 transition-colors duration-200">
            <thead className="bg-gray-100 dark:bg-neutral-800">
              <tr>
                {['Message', 'Status', 'Date', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
              {notifications.map(n => (
                <tr key={n._id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors duration-150">
                  <td className="px-4 py-3 text-sm">{n.message}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={n.read ? 'text-gray-500 dark:text-gray-400' : 'text-yellow-500 font-semibold'}>
                      {n.read ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(n.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-row gap-2">
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="bg-green-500 hover:bg-green-600 p-2 rounded-md text-white flex items-center justify-center"
                          title="Mark Read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="bg-red-500 hover:bg-red-600 p-2 rounded-md text-white flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
