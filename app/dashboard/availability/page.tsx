"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { BookmarkCheck, ChevronLeft, ChevronRight } from "lucide-react";

/* ---------------- HELPERS ---------------- */
const formatDate = (d: Date) => d.toISOString().split("T")[0];
const formatLocalDate = (d: Date) => d.toLocaleDateString("en-CA");
const formatDisplayDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const formatRange = (start: Date, end: Date) =>
  `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" }
  )}`;

const getWeekDates = (offset: number = 0) => {
  const today = new Date();
  const day = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
};

const isPastSlot = (dateStr: string, slotTime: string) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const slotDate = new Date(`${dateStr}T00:00:00`);

  if (slotDate < todayStart) return true;
  if (slotDate > todayStart) return false;

  const startTime = slotTime.split(" - ")[0];
  const [hours, minutes] = startTime.split(":").map(Number);

  const slotDateTime = new Date();
  slotDateTime.setHours(hours, minutes, 0, 0);

  return slotDateTime <= now;
};

/* ---------------- COMPONENT ---------------- */
export default function AvailabilityPage() {
  const { provider } = useAuth();
  const [providerId, setProviderId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [weekSlots, setWeekSlots] = useState<any[]>([]);
  const [savingDate, setSavingDate] = useState<string | null>(null);

  /* ---------- GET PROVIDER ID ---------- */
  useEffect(() => {
    const id = provider?.id || provider?._id;
    if (id) {
      console.log("Provider ID:", id);
      setProviderId(id);
    }
  }, [provider?.id, provider?._id]);

  /* ---------- SET WEEK ---------- */
  useEffect(() => {
    const dates = getWeekDates(weekOffset);
    console.log("Week Dates:", dates);
    setWeekDates(dates);
  }, [weekOffset]);

  /* ---------- FETCH WEEK DATA ---------- */
  useEffect(() => {
    if (!providerId || weekDates.length === 0) return;

    const fetchWeek = async () => {
      try {
        const weekData = [];

        for (const dateObj of weekDates) {
          const dateStr = formatDate(dateObj);

          const res = await api.get(`/providers/${providerId}/slots`, {
            params: { date: dateStr },
          });

          const backendSlots = res.data.slots || [];
          console.log(`Fetched slots for ${dateStr}:`, backendSlots);

          const formattedSlots = backendSlots.map((slot: any) => ({
            time: slot.time,
            available: !slot.isBooked && slot.isAvailable, // true = green
            isBooked: slot.isBooked,
          }));

          weekData.push({
            date: dateStr,
            day: formatDisplayDate(dateObj),
            slots: formattedSlots,
          });
        }

        setWeekSlots(weekData);
      } catch (err: any) {
        console.error("Error fetching week slots:", err);
        toast.error("Failed to load week availability");
      }
    };

    fetchWeek();
  }, [providerId, weekDates]);

  /* ---------- TOGGLE SLOT ---------- */
  const toggleSlot = (date: string, time: string) => {
    setWeekSlots((prev) =>
      prev.map((day) =>
        day.date !== date
          ? day
          : {
              ...day,
              slots: day.slots.map((slot: any) =>
                slot.time === time && !slot.isBooked
                  ? { ...slot, available: !slot.available } // flip true<->false
                  : slot
              ),
            }
      )
    );
  };

  /* ---------- SAVE DATE OVERRIDES ---------- */
  const saveDateOverrides = async (date: string) => {
    if (!providerId) return;

    setSavingDate(date);
    try {
      const payload = {
        dateOverrides: weekSlots.map((day) => ({
          date: day.date,
          slots: day.slots.map((s: any) => ({
            time: s.time,
            isAvailable: !s.isBooked && s.available, // backend field
          })),
        })),
      };

      console.log("Saving payload:", payload);

      await api.put(`/providers/${providerId}/availability`, payload);
      toast.success("Availability saved");
    } catch (err: any) {
      console.error("Error saving availability:", err);
      toast.error("Failed to save availability");
    } finally {
      setSavingDate(null);
    }
  };

  /* ---------------- RENDER ---------------- */
  const weekRange =
    weekDates.length > 0 ? formatRange(weekDates[0], weekDates[weekDates.length - 1]) : "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Weekly Availability
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set open slots for {weekRange || "this week"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setWeekOffset((p) => p - 1)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm
            hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200"
            aria-label="Previous week"
            title="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setWeekOffset((p) => p + 1)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm
            hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200"
            aria-label="Next week"
            title="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          Available
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          Unavailable
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-400" />
          Booked or past
        </div>
      </div>

      {/* Week Slots */}
      {weekSlots.map((day) => (
        <div
          key={day.date}
          className="border rounded-2xl p-4 sm:p-5 bg-white shadow-sm
          border-gray-200 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{day.day}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{day.date}</p>
            </div>
            <button
              onClick={() => saveDateOverrides(day.date)}
              disabled={savingDate === day.date}
              className={clsx(
                "h-10 w-10 inline-flex items-center justify-center rounded-xl text-sm font-medium shadow-sm",
                savingDate === day.date
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-neutral-800 dark:text-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
              aria-label="Save day availability"
              title="Save day availability"
            >
              {savingDate === day.date ? (
                <span className="text-xs">...</span>
              ) : (
                <BookmarkCheck size={18} />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {day.slots.map((slot: any, idx: number) => (
              <button
                key={idx}
                onClick={() => toggleSlot(day.date, slot.time)}
                disabled={slot.isBooked || isPastSlot(day.date, slot.time)}
                className={clsx(
                  "px-3 py-2 rounded-xl text-sm font-medium transition shadow-sm",
                  slot.isBooked || isPastSlot(day.date, slot.time)
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-neutral-800 dark:text-gray-400"
                    : slot.available
                    ? "bg-emerald-500/90 text-white hover:bg-emerald-500" // available
                    : "bg-yellow-500 text-white hover:bg-yellow-600" // unavailable
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
