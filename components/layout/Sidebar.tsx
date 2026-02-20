"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getNotifications } from "@/services/notificationService";
import { useNotifications } from "@/context/NotificationContext";
import {
  LayoutDashboard,
  CalendarClock,
  Clock3,
  CalendarX2,
  UserRound,
  Bell,
  X,
} from "lucide-react";

type SidebarProps = {
  isOpen: boolean;
  closeSidebar: () => void;
};

export default function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const pathname = usePathname();
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
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 overflow-y-auto border-r border-gray-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800">
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">Provider Panel</span>
          <button
            type="button"
            onClick={closeSidebar}
            className="md:hidden h-8 w-8 inline-flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3 pb-4">
          {[
            { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
            { name: "Appointments", href: "/dashboard/appointments", icon: <CalendarClock size={16} /> },
            { name: "Availability", href: "/dashboard/availability", icon: <Clock3 size={16} /> },
            { name: "Unavailable Dates", href: "/dashboard/unavailable-dates", icon: <CalendarX2 size={16} /> },
            { name: "Profile", href: "/dashboard/profile", icon: <UserRound size={16} /> },
            { name: "Notifications", href: "/dashboard/notifications", icon: <Bell size={16} /> },
          ].map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeSidebar}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-blue-300" />
                )}
                <span
                  className={`relative ${
                    active
                      ? "text-white"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  }`}
                >
                  {link.icon}
                  {link.name === "Notifications" && hasUnreadNotifications && (
                    <span
                      className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500"
                      aria-label="New notifications"
                    />
                  )}
                </span>
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
