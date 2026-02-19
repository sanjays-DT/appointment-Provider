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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =============================
  // FETCH DASHBOARD DATA
  // =============================
  useEffect(() => {
    if (isInitializing || !provider?._id) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await api.get<DashboardStats>(
          `/providers/${provider._id}/dashboard-stats`
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
  }, [isInitializing, provider]);

  const weeklyBookings = stats?.weeklyBookings ?? EMPTY_WEEKLY_BOOKINGS;

  // =============================
  // DARK MODE CHART (FORCED DARK)
  // =============================
  const chartData = useMemo(() => {
    return {
      labels: weeklyBookings.map((b) => b.label),
      datasets: [
        {
          label: "Bookings",
          data: weeklyBookings.map((b) => b.value),
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59,130,246,0.25)",
          borderWidth: 3,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "#3B82F6",
        },
      ],
    };
  }, [weeklyBookings]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false, // allows custom height
      plugins: {
        legend: {
          labels: {
            color: "#FFFFFF",
            font: {
              size: 13,
              weight: 500,
            },
          },
        },
        title: {
          display: true,
          text: "Weekly Bookings",
          color: "#FFFFFF",
          font: {
            size: 16,
            weight: 600,
          },
        },
        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#FFFFFF",
          bodyColor: "#E5E7EB",
          borderColor: "#1F2937",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#D1D5DB",
          },
          grid: {
            color: "rgba(255,255,255,0.08)",
          },
        },
        y: {
          ticks: {
            color: "#D1D5DB",
          },
          grid: {
            color: "rgba(255,255,255,0.08)",
          },
        },
      },
    };
  }, []);

  // =============================
  // STATES
  // =============================

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black px-6 py-8">
        <p className="text-gray-400">Loading provider info...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-500">
          Provider not found. Please log in again.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-40 bg-gray-800 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-900 p-6 rounded-xl animate-pulse min-h-[120px]"
              />
            ))}
          </div>
          <div className="bg-gray-900 rounded-xl animate-pulse h-[260px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-500">Error loading dashboard: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">
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
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Track your appointment performance at a glance.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">{card.title}</p>
                <card.icon className="h-5 w-5 text-blue-400" />
              </div>

              <h2 className="text-3xl font-bold">{card.value}</h2>
            </div>
          ))}
        </div>

        {/* Reduced Chart Size */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-[260px]">
          {weeklyBookings.length === 0 ? (
            <p className="text-gray-400">
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
