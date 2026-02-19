"use client";
import Link from "next/link";
import { useEffect } from "react";
import { getNotifications } from "@/services/notificationService";
import { useNotifications } from "@/context/NotificationContext";

export default function Sidebar() {
  const { notifications, setNotifications } = useNotifications();
  const hasUnreadNotifications = Array.isArray(notifications)
    ? notifications.some((notification) => !notification.read)
    : false;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        const list =
          res.data?.notifications ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        setNotifications(list);
      } catch {
        // Ignore fetch errors here so sidebar navigation still renders.
      }
    };

    fetchNotifications();
  }, [setNotifications]);

  return (
    <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 p-6 flex flex-col">
      <nav className="space-y-2 flex-1">
        {[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Appointments", href: "/dashboard/appointments" },
          { name: "Availability", href: "/dashboard/availability" },
          { name: "Unavailable Dates", href: "/dashboard/unavailable-dates" },
          { name: "Profile", href: "/dashboard/profile" },
          {name:"Notifications",href:"/dashboard/notifications"}
        ].map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="relative block px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-300"
          >
            {link.name}
            {link.name === "Notifications" && hasUnreadNotifications && (
              <span
                className="absolute top-1 right-3 h-2.5 w-2.5 rounded-full bg-red-500"
                aria-label="New notifications"
              />
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
