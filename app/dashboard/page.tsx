"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useTheme } from "@/context/ThemeContext";
import { CalendarCheck, CalendarDays, Ban } from "lucide-react";
import api from "@/lib/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

const EMPTY_WEEKLY_BOOKINGS: Booking[] = [];

export default function DashboardPage() {
  const { provider, isInitializing } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const providerId = provider.id;

  // =============================
  // FETCH DASHBOARD DATA
  // =============================
  useEffect(() => {
    if (isInitializing) return;
    if (!providerId) {
      setLoading(false);
      setError("Provider ID is missing. Please log in again.");
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get<DashboardStats>(
          `/providers/${providerId}/dashboard-stats`
        );

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
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isInitializing, providerId]);

  const weeklyBookings = stats?.weeklyBookings ?? EMPTY_WEEKLY_BOOKINGS;

  const chartData = useMemo(() => {
    const pointColor = theme === "dark" ? "#60A5FA" : "#2563EB";
    return {
      labels: weeklyBookings.map((b) => b.label),
      datasets: [
        {
          label: "Bookings",
          data: weeklyBookings.map((b) => b.value),
          borderColor: pointColor,
          backgroundColor:
            theme === "dark" ? "rgba(96,165,250,0.25)" : "rgba(37,99,235,0.18)",
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: pointColor,
        },
      ],
    };
  }, [theme, weeklyBookings]);

  const chartOptions = useMemo(() => {
    const isDark = theme === "dark";
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: isDark ? "#E5E7EB" : "#1F2937",
            font: {
              size: 13,
              weight: 500,
            },
          },
        },
        title: {
          display: true,
          text: "Weekly Bookings",
          color: isDark ? "#F9FAFB" : "#111827",
          font: {
            size: 16,
            weight: 600,
          },
        },
        tooltip: {
          backgroundColor: isDark ? "#111827" : "#FFFFFF",
          titleColor: isDark ? "#FFFFFF" : "#111827",
          bodyColor: isDark ? "#E5E7EB" : "#374151",
          borderColor: isDark ? "#374151" : "#D1D5DB",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: isDark ? "#D1D5DB" : "#374151",
          },
          grid: {
            color: isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,39,0.08)",
          },
        },
        y: {
          ticks: {
            color: isDark ? "#D1D5DB" : "#374151",
          },
          grid: {
            color: isDark ? "rgba(255,255,255,0.08)" : "rgba(17,24,39,0.08)",
          },
        },
      },
    };
  }, [theme]);

  // =============================
  // STATES
  // =============================

  if (isInitializing) {
    return (
      <div className="w-full bg-slate-50 dark:bg-neutral-950 px-6 py-8">
        <p className="text-gray-500 dark:text-gray-400">Loading provider info...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-[70vh] w-full bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
        <p className="text-red-500">
          Provider not found. Please log in again.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-slate-50 dark:bg-neutral-950 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-40 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-6 rounded-xl animate-pulse min-h-[120px]"
              />
            ))}
          </div>
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl animate-pulse h-[260px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] w-full bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
        <p className="text-red-500">Error loading dashboard: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-[70vh] w-full bg-slate-50 dark:bg-neutral-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          No dashboard stats available.
        </p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: CalendarCheck,
    },
    {
      title: "This Week",
      value: stats.thisWeek,
      icon: CalendarDays,
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: Ban,
    },
  ];

  return (
  <div className="w-full h-[552px] overflow-hidden bg-slate-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 px-6 py-6">
    <div className="h-full max-w-6xl mx-auto flex flex-col">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Track your appointment performance at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {card.title}
              </p>
              <card.icon className="h-4 w-4 text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold">{card.value}</h2>
          </div>
        ))}
      </div>

      {/* Chart - Takes Remaining Space */}
      <div className="flex-1 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 min-h-0">
        {weeklyBookings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No weekly bookings available.
          </p>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>

    </div>
  </div>
);

}
