"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "@/context/AuthContext";
import { CalendarCheck, CalendarDays, Ban } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Booking {
  label: string;
  value: number;
}

interface DashboardStats {
  totalAppointments: number;
  thisWeek: number;
  cancelled: number;
  weeklyBookings: Booking[];
}

export default function DashboardPage() {
  const { provider } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode dynamically
  useEffect(() => {
    const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Log provider to debug
  useEffect(() => {
    console.log("Dashboard render, provider:", provider);
  }, [provider]);

  // Fetch dashboard stats when provider is ready
  useEffect(() => {
    if (!provider?._id) {
      console.log("Provider not ready yet, waiting...");
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching dashboard stats...");

        const { data } = await axios.get<DashboardStats>(
          "http://localhost:5000/api/Providers/dashboard/getProviderWeeklyBookings",
          { params: { providerId: provider._id } }
        );

        console.log("Dashboard data fetched:", data);

        // Validate backend response
        if (
          typeof data.totalAppointments !== "number" ||
          typeof data.thisWeek !== "number" ||
          typeof data.cancelled !== "number" ||
          !Array.isArray(data.weeklyBookings)
        ) {
          throw new Error("Invalid data format from backend");
        }

        setStats(data);
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [provider]);

  // Show loading while provider or stats are not ready
  if (!provider) {
    return (
      <div className="p-6 text-gray-400 dark:text-gray-500">
        <p>Loading provider info...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl bg-neutral-800 dark:bg-neutral-900 p-6 shadow animate-pulse min-h-[120px]"
          />
        ))}
        <div className="md:col-span-3 rounded-xl bg-neutral-800 dark:bg-neutral-900 p-6 shadow animate-pulse min-h-[250px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        <p>Error loading dashboard: {error}</p>
      </div>
    );
  }

  if (!stats || stats.weeklyBookings.length === 0) {
    return (
      <div className="p-6 text-gray-400 dark:text-gray-500">
        <p>No bookings available for this week.</p>
      </div>
    );
  }

  // Chart colors based on dark mode
  const borderColor = isDarkMode ? "#A5B4FC" : "#4F46E5";
  const bgColor = isDarkMode ? "rgba(165, 180, 252, 0.2)" : "rgba(79, 70, 229, 0.1)";
  const textColor = isDarkMode ? "#E5E7EB" : "#111827";

  const chartData = {
    labels: stats.weeklyBookings.map((b) => b.label),
    datasets: [
      {
        label: "Bookings",
        data: stats.weeklyBookings.map((b) => b.value),
        borderColor,
        backgroundColor: bgColor,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: textColor } },
      title: { display: true, text: "Weekly Bookings", color: textColor },
      tooltip: { titleColor: textColor, bodyColor: textColor },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: isDarkMode ? "#374151" : "#E5E7EB" } },
      y: { ticks: { color: textColor }, grid: { color: isDarkMode ? "#374151" : "#E5E7EB" } },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your appointment performance at a glance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cards */}
          {[
            { title: "Total Appointments", value: stats.totalAppointments, icon: CalendarCheck },
            { title: "This Week", value: stats.thisWeek, icon: CalendarDays },
            { title: "Cancelled", value: stats.cancelled, icon: Ban },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-gray-200 dark:border-neutral-800 min-h-[120px]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <span className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 inline-flex items-center justify-center dark:bg-blue-500/10 dark:text-blue-400">
                  <card.icon size={18} />
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-3">
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Weekly Bookings Chart */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-gray-200 dark:border-neutral-800 min-h-[250px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
