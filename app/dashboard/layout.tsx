"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/context/NotificationContext";
import { PanelLeft } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <NotificationProvider>
        <div className="bg-slate-50 dark:bg-neutral-950 overflow-x-hidden min-h-[562px]">

          
          <Sidebar
            isOpen={isSidebarOpen}
            closeSidebar={() => setIsSidebarOpen(false)}
          />

          <div className="md:ml-64 flex flex-col">
            
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-20 h-14 px-4 flex items-center border-b border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                aria-label="Open sidebar"
              >
                <PanelLeft size={18} />
              </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>

          </div>
        </div>
      </NotificationProvider>
    </ProtectedRoute>
  );
}
