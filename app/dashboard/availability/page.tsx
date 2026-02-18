"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { BookmarkCheck, CalendarClock, ChevronLeft, ChevronRight, Clock3, Save } from "lucide-react";

type DayAvailability = {
  day: string;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  enabled: boolean;
};

type SlotItem = {
  time: string;
  available: boolean;
  isBooked: boolean;
};

type WeekDaySlots = {
  date: string;
  day: string;
  slots: SlotItem[];
};

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_WEEK: DayAvailability[] = [
  { day: "Monday", startTime: "09:00", endTime: "16:00", slotMinutes: 30, enabled: true },
  { day: "Tuesday", startTime: "09:00", endTime: "16:00", slotMinutes: 30, enabled: true },
  { day: "Wednesday", startTime: "09:00", endTime: "16:00", slotMinutes: 30, enabled: true },
  { day: "Thursday", startTime: "09:00", endTime: "16:00", slotMinutes: 30, enabled: true },
  { day: "Friday", startTime: "09:00", endTime: "16:00", slotMinutes: 30, enabled: true },
  { day: "Saturday", startTime: "09:00", endTime: "12:00", slotMinutes: 30, enabled: true },
  { day: "Sunday", startTime: "09:00", endTime: "12:00", slotMinutes: 30, enabled: true },
];

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const formatRange = (start: Date, end: Date) =>
  `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;

const getWeekDates = (offset = 0) => {
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

  const startPart = slotTime.split(" - ")[0]?.trim() || "";
  const [hours, minutes] = startPart.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;

  const slotDateTime = new Date();
  slotDateTime.setHours(hours, minutes, 0, 0);
  return slotDateTime <= now;
};

const toMins = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const fromMins = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const templateFromWeeklySlots = (weeklyAvailability: any[]): DayAvailability[] => {
  const byDay = new Map<string, any>();
  (weeklyAvailability || []).forEach((item) => {
    if (item?.day) byDay.set(item.day, item);
  });

  return DAY_ORDER.map((day) => {
    const row = byDay.get(day);
    if (!row || !Array.isArray(row.slots) || row.slots.length === 0) {
      const fallback = DEFAULT_WEEK.find((d) => d.day === day)!;
      return { ...fallback, enabled: false };
    }

    const first = row.slots[0]?.time || "";
    const last = row.slots[row.slots.length - 1]?.time || "";
    const firstStart = first.split(" - ")[0] || "09:00";
    const firstEnd = first.split(" - ")[1] || "09:30";
    const lastEnd = last.split(" - ")[1] || "16:00";
    const slotMinutes = Math.max(5, toMins(firstEnd) - toMins(firstStart) || 30);

    return {
      day,
      startTime: firstStart,
      endTime: lastEnd,
      slotMinutes,
      enabled: true,
    };
  });
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

const buildSlotsFromTemplate = (template: DayAvailability): SlotItem[] => {
  if (!template.enabled) return [];

  const start = toMinutes(template.startTime);
  const end = toMinutes(template.endTime);
  const step = Number(template.slotMinutes);

  if (!step || step < 5 || start >= end) return [];

  const slots: SlotItem[] = [];
  for (let cur = start; cur + step <= end; cur += step) {
    slots.push({
      time: `${toTime(cur)} - ${toTime(cur + step)}`,
      available: true,
      isBooked: false,
    });
  }

  return slots;
};

const getDayName = (dateObj: Date) => dateObj.toLocaleDateString("en-US", { weekday: "long" });

export default function AvailabilityPage() {
  const { provider } = useAuth();

  const [providerId, setProviderId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [weekSlots, setWeekSlots] = useState<WeekDaySlots[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const [availability, setAvailability] = useState<DayAvailability[]>(DEFAULT_WEEK);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showTimingEditor, setShowTimingEditor] = useState(false);
  const blockedDateSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const fetchTemplate = async (_id: string) => {
    setLoadingTemplate(true);
    try {
      const res = await api.get(`/providers/dashboard`);
      setAvailability(templateFromWeeklySlots(res.data?.provider?.weeklyAvailability || []));
      return true;
    } catch (err: any) {
      toast.error("Failed to load timing template");
      return false;
    } finally {
      setLoadingTemplate(false);
    }
  };

  useEffect(() => {
    const id = provider?.id || provider?._id;
    if (id) setProviderId(id);
  }, [provider?.id, provider?._id]);

  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset));
  }, [weekOffset]);

  useEffect(() => {
    if (!providerId) return;
    fetchTemplate(providerId);
  }, [providerId]);

  useEffect(() => {
    if (!providerId) return;

    const fetchBlockedDates = async () => {
      try {
        const { data } = await api.get(`/providers/${providerId}/unavailable-dates`);
        setBlockedDates(data?.unavailableDates || []);
      } catch (err: any) {
        console.error("Error fetching unavailable dates:", err);
        setBlockedDates([]);
      }
    };

    fetchBlockedDates();
  }, [providerId]);

  useEffect(() => {
    if (!providerId || weekDates.length === 0) return;

    const fetchWeek = async () => {
      setLoadingSlots(true);
      try {
        const weekData: WeekDaySlots[] = [];

        for (const dateObj of weekDates) {
          const dateStr = formatDate(dateObj);
          const dayName = getDayName(dateObj);
          const template = availability.find((a) => a.day === dayName);
          const isEnabledDay = Boolean(template?.enabled);
          const isBlockedDate = blockedDateSet.has(dateStr);

          if (!isEnabledDay || isBlockedDate) {
            continue;
          }

          const res = await api.get(`/providers/${providerId}/slots`, {
            params: { date: dateStr },
          });

          const backendSlots = res.data?.slots || [];

          const formattedSlots: SlotItem[] =
            backendSlots.length > 0
              ? backendSlots.map((slot: any) => ({
                  time: slot.time,
                  available: !slot.isBooked && slot.isAvailable,
                  isBooked: slot.isBooked,
                }))
              : template
              ? buildSlotsFromTemplate(template)
              : [];

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
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchWeek();
  }, [providerId, weekDates, availability, blockedDateSet]);

  const updateField = (
    day: string,
    field: "startTime" | "endTime" | "slotMinutes" | "enabled",
    value: string | number | boolean
  ) => {
    setAvailability((prev) =>
      prev.map((item) =>
        item.day === day
          ? {
              ...item,
              [field]: field === "slotMinutes" ? Number(value) : value,
            }
          : item
      )
    );
  };

  const saveTemplateAvailability = async () => {
    if (!providerId) return;

    const enabledDays = availability.filter((d) => d.enabled);
    if (enabledDays.length === 0) {
      toast.error("Enable at least one day");
      return;
    }

    for (const d of enabledDays) {
      if (!d.startTime || !d.endTime) {
        toast.error(`Set valid time for ${d.day}`);
        return;
      }
      if (d.startTime >= d.endTime) {
        toast.error(`${d.day}: start time must be before end time`);
        return;
      }
      if (d.slotMinutes < 5) {
        toast.error(`${d.day}: slot minutes should be at least 5`);
        return;
      }
    }

    setSavingTemplate(true);
    try {
      await api.put(`/providers/${providerId}/availability`, {
        weeklyAvailability: availability
          .filter((d) => d.enabled)
          .map((d) => ({
            day: d.day,
            startTime: d.startTime,
            endTime: d.endTime,
            slotMinutes: d.slotMinutes,
          })),
      });
      await fetchTemplate(providerId);
      toast.success("Weekly timing saved");
    } catch (err: any) {
      console.error("Error saving timing:", err);
      toast.error("Failed to save timing");
    } finally {
      setSavingTemplate(false);
    }
  };

  const toggleSlot = (date: string, time: string) => {
    setWeekSlots((prev) =>
      prev.map((day) =>
        day.date !== date
          ? day
          : {
              ...day,
              slots: day.slots.map((slot) =>
                slot.time === time && !slot.isBooked ? { ...slot, available: !slot.available } : slot
              ),
            }
      )
    );
  };

  const saveDateOverrides = async (date: string) => {
    if (!providerId) return;

    const selectedDay = weekSlots.find((d) => d.date === date);
    if (!selectedDay) return;

    setSavingDate(date);
    try {
      await api.put(`/providers/${providerId}/availability`, {
        dateOverrides: [
          {
            date: selectedDay.date,
            slots: selectedDay.slots.map((s) => ({
              time: s.time,
              isAvailable: !s.isBooked && s.available,
            })),
          },
        ],
      });
      toast.success("Day overrides saved");
    } catch (err: any) {
      console.error("Error saving overrides:", err);
      toast.error("Failed to save day overrides");
    } finally {
      setSavingDate(null);
    }
  };

  const weekRange =
    weekDates.length > 0 ? formatRange(weekDates[0], weekDates[weekDates.length - 1]) : "";

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-cyan-50/40 to-blue-100/30 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">Availability & Timing</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure weekly timings and override individual day slots.</p>
        </div>
        <button
          onClick={() => setShowTimingEditor((prev) => !prev)}
          className={clsx(
            "h-10 px-4 rounded-xl text-sm font-medium shadow-sm",
            showTimingEditor
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-800 dark:text-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {showTimingEditor ? "Hide Weekly Availability" : "Edit Weekly Availability"}
        </button>
      </div>

      {showTimingEditor && (
        <div className="rounded-2xl border border-blue-100 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900 p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Weekly Availability</h2>
            <button
              onClick={saveTemplateAvailability}
              disabled={savingTemplate || loadingTemplate}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-xl text-sm font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
            >
              <Save size={16} />
              {savingTemplate ? "Saving..." : "Save Weekly Availability"}
            </button>
          </div>

          {loadingTemplate ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading timing template...</p>
          ) : (
            availability.map((day) => (
              <div key={day.day} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center border-b border-gray-100 dark:border-neutral-800 pb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => updateField(day.day, "enabled", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {day.day}
                </label>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Start</label>
                  <input
                    type="time"
                    value={day.startTime}
                    disabled={!day.enabled}
                    onChange={(e) => updateField(day.day, "startTime", e.target.value)}
                    className="h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">End</label>
                  <input
                    type="time"
                    value={day.endTime}
                    disabled={!day.enabled}
                    onChange={(e) => updateField(day.day, "endTime", e.target.value)}
                    className="h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Slot (mins)</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={day.slotMinutes}
                    disabled={!day.enabled}
                    onChange={(e) => updateField(day.day, "slotMinutes", Number(e.target.value))}
                    className="h-10 px-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
                  />
                </div>

                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1">
                  <Clock3 size={14} />
                  {day.enabled ? "Working day" : "Day off"}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!showTimingEditor && (
      <div className="rounded-2xl border border-blue-100 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Weekly Slot Overrides</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Set open slots for {weekRange || "this week"}.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((p) => p - 1)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-blue-600 hover:text-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200"
              aria-label="Previous week"
              title="Previous week"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setWeekOffset((p) => p + 1)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-blue-600 hover:text-white dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-200"
              aria-label="Next week"
              title="Next week"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            Available
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            Unavailable
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-gray-400" />
            Booked or past
          </div>
        </div>

        {loadingSlots ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading slots...</p>
        ) : weekSlots.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No available days in this week. Check weekly timing or unavailable dates.
          </p>
        ) : (
          weekSlots.map((day) => (
            <div
              key={day.date}
              className="border rounded-2xl p-4 sm:p-5 bg-white shadow-sm border-gray-200 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 inline-flex items-center justify-center dark:bg-blue-500/10 dark:text-blue-400">
                    <CalendarClock size={16} />
                  </span>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">{day.day}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{day.date}</p>
                  </div>
                </div>

                <button
                  onClick={() => saveDateOverrides(day.date)}
                  disabled={savingDate === day.date}
                  className={clsx(
                    "h-10 px-3 inline-flex items-center gap-2 rounded-xl text-sm font-medium shadow-sm",
                    savingDate === day.date
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-neutral-800 dark:text-gray-400"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                  aria-label="Save day availability"
                  title="Save day availability"
                >
                  <BookmarkCheck size={16} />
                  {savingDate === day.date ? "Saving..." : "Save Day"}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {day.slots.map((slot, idx) => (
                  <button
                    key={`${slot.time}-${idx}`}
                    onClick={() => toggleSlot(day.date, slot.time)}
                    disabled={slot.isBooked || isPastSlot(day.date, slot.time)}
                    className={clsx(
                      "px-3 py-2 rounded-xl text-sm font-medium transition shadow-sm",
                      slot.isBooked || isPastSlot(day.date, slot.time)
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-neutral-800 dark:text-gray-400"
                        : slot.available
                        ? "bg-emerald-500/90 text-white hover:bg-emerald-500"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      )}
    </div>
  );
}
