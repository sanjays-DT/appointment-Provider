"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, BookmarkCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/axios";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

export default function UnavailableDatesPage() {
  const { provider } = useAuth();
  const providerId = provider?._id || provider?.id || null;

  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!providerId) return;

    const fetchData = async () => {
      try {
        const { data } = await api.get(
          `/providers/${providerId}/unavailable-dates`
        );
        setBlockedDates(data.unavailableDates || []);
      } catch (err: any) {
        console.log("Fetch error:", err.response?.data || err.message);
      }
    };

    fetchData();
  }, [providerId]);

  /* ================= SAVE ================= */
  const saveUnavailableDate = async () => {
    if (!providerId || !selectedDate) return;

    try {
      setSaving(true);

      if (blockedDates.includes(selectedDate)) {
        const { data } = await api.delete(
          `/providers/${providerId}/unavailable-dates`,
          { data: { date: selectedDate } }
        );
        setBlockedDates(data.unavailableDates);
        toast.success("Holiday removed");
      } else {
        const updatedDates = [...blockedDates, selectedDate];

        const { data } = await api.put(
          `/providers/${providerId}/unavailable-dates`,
          { dates: updatedDates }
        );

        setBlockedDates(data.unavailableDates);
        toast.success("Holiday added");
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= CALENDAR ================= */

  const monthLabel = useMemo(
    () =>
      viewMonth.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
    [viewMonth]
  );

  const daysInGrid = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDayIndex = firstDay.getDay();

    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];

    // Leading empty cells
    for (let i = 0; i < startDayIndex; i++) {
      cells.push(null);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      cells.push(new Date(year, month, d));
    }

    // Force 42 cells (6 rows × 7 columns)
    while (cells.length < 42) {
      cells.push(null);
    }

    return cells;
  }, [viewMonth]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /* ================= RENDER ================= */

  return (
    <div className="h-[555px] w-full bg-slate-50 dark:bg-neutral-950 px-4 py-4 flex justify-center relative -top-2">
      <div className="w-full max-w-5xl">

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-4 shadow-sm border dark:border-neutral-800">

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center dark:bg-red-500/10 dark:text-red-400">
                <Ban size={16} />
              </span>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Unavailable Dates
              </h2>
            </div>

            <button
              onClick={saveUnavailableDate}
              disabled={!selectedDate || saving}
              className={clsx(
                "h-9 px-3 rounded-lg text-sm font-medium transition",
                !selectedDate || saving
                  ? "bg-gray-200 dark:bg-neutral-800 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <BookmarkCheck size={14} className="inline mr-1" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() =>
                setViewMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
              className="h-8 w-8 flex items-center justify-center rounded-lg border dark:border-neutral-800"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {monthLabel}
            </span>

            <button
              onClick={() =>
                setViewMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
              className="h-8 w-8 flex items-center justify-center rounded-lg border dark:border-neutral-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-xs font-semibold text-center mb-1">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div key={d} className="py-1 text-gray-500 dark:text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid - FIXED HEIGHT */}
          <div className="grid grid-cols-7 grid-rows-6 border rounded-xl overflow-hidden dark:border-neutral-800 h-[360px]">

            {daysInGrid.map((date, i) => {
              if (!date) {
                return (
                  <div
                    key={i}
                    className="border dark:border-neutral-800"
                  />
                );
              }

              const dateStr = formatDate(date);
              const isBlocked = blockedDates.includes(dateStr);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={clsx(
                    "p-2 border flex flex-col justify-start text-left transition dark:border-neutral-800",
                    isSelected && "ring-2 ring-blue-500",
                    isBlocked
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-neutral-800"
                  )}
                >
                  <span className="text-sm font-semibold">
                    {date.getDate()}
                  </span>

                  <span
                    className={clsx(
                      "mt-1 w-2 h-2 rounded-full",
                      isBlocked ? "bg-red-500" : "bg-green-500"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Selected Info */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Selected:{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {selectedDate || "None"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
