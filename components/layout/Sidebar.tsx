"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 p-6 flex flex-col">
      <nav className="space-y-2 flex-1">
        {[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Appointments", href: "/dashboard/appointments" },
          { name: "Availability", href: "/dashboard/availability" },
          { name: "Unavailable Dates", href: "/dashboard/unavailable-dates" },
          { name: "Profile", href: "/dashboard/profile" },
        ].map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="block px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-300"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
