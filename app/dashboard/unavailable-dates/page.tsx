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

  /* =========================
     FETCH UNAVAILABLE DATES
     ========================= */
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

  /* =========================
     SAVE UNAVAILABLE DATE
     ========================= */
  const saveUnavailableDate = async () => {
  if (!providerId || !selectedDate) return;

  try {
    setSaving(true);

    if (blockedDates.includes(selectedDate)) {
      // 🔴 REMOVE (Revoke leave)
      const { data } = await api.delete(
        `/providers/${providerId}/unavailable-dates`,
        { data: { date: selectedDate } }
      );

      setBlockedDates(data.unavailableDates);
      toast.success("Holiday removed");
    } else {
      // 🟢 ADD
      const updatedDates = [...blockedDates, selectedDate];

      const { data } = await api.put(
        `/providers/${providerId}/unavailable-dates`,
        { dates: updatedDates }
      );

      setBlockedDates(data.unavailableDates);
      toast.success("Holiday added");
    }

  } catch (err: any) {
    toast.error("Action failed");
  } finally {
    setSaving(false);
  }
};

  /* =========================
     CALENDAR LOGIC
     ========================= */

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

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const leading = first.getDay();
    const totalDays = last.getDate();

    const cells: (Date | null)[] = [];

    for (let i = 0; i < leading; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++)
      cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [viewMonth]);

 const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};



  /* =========================
     RENDER
     ========================= */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-red-50 text-red-600 inline-flex items-center justify-center dark:bg-red-500/10 dark:text-red-400">
              <Ban size={18} />
            </span>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Unavailable Dates
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setViewMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
              className="h-10 w-10 flex items-center justify-center rounded-xl border dark:border-neutral-800"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              {monthLabel}
            </span>

            <button
              onClick={() =>
                setViewMonth(
                  (prev) =>
                    new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
              className="h-10 w-10 flex items-center justify-center rounded-xl border dark:border-neutral-800"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm border dark:border-neutral-800">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={saveUnavailableDate}
              disabled={!selectedDate || saving}
              className={clsx(
                "h-10 px-4 rounded-xl text-sm font-medium",
                !selectedDate || saving
                  ? "bg-gray-200 dark:bg-neutral-800 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <BookmarkCheck size={16} className="inline mr-2" />
              {saving ? "Saving..." : "Save selected date"}
            </button>
          </div>

          <div className="grid grid-cols-7 border rounded-xl overflow-hidden dark:border-neutral-800">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-semibold bg-gray-100 dark:bg-neutral-800"
              >
                {d}
              </div>
            ))}

            {daysInGrid.map((date, i) => {
              if (!date)
                return <div key={i} className="min-h-[100px] border" />;

              const dateStr = formatDate(date);
              const isBlocked = blockedDates.includes(dateStr);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={clsx(
                    "text-left p-2 min-h-[100px] border transition",
                    isSelected && "ring-2 ring-blue-500",
                    isBlocked
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-neutral-800"
                  )}
                >
                  <div className="text-sm font-semibold">
                    {date.getDate()}
                  </div>

                  <div className="text-xs mt-2">
                    {isBlocked ? "Not Available" : "Available"}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-sm">
            Selected date:{" "}
            <span className="font-medium">
              {selectedDate || "None"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
