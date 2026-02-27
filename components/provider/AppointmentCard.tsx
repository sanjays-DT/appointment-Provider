"use client";

import { Fragment, useEffect, useState } from "react";
import {
  getProviderAppointments,
  rescheduleAppointment,
  approveAppointment,
  rejectAppointment,
} from "@/services/appointmentService";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Search, Clock } from "lucide-react";
import api from "@/lib/axios";
import { getDecodedToken, getProvider } from "@/lib/auth";

interface Appointment {
  _id: string;
  userId: { name: string } | string;
  providerId: { name: string; _id?: string } | string;
  start: string;
  end: string;
  status: string;
}

interface ProviderSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
}

const formatDateInput = (value: string | Date) => {
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const isPastSlot = (dateStr: string, slotTime: string) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const slotDate = new Date(`${dateStr}T00:00:00`);

  if (slotDate < todayStart) return true;
  if (slotDate > todayStart) return false;

  const [startTime] = slotTime.split(" - ");
  const [hours, minutes] = startTime.split(":").map(Number);
  const slotDateTime = new Date();
  slotDateTime.setHours(hours, minutes, 0, 0);

  return slotDateTime <= now;
};

export default function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState("");
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const providerData = getProvider();
      const decoded = getDecodedToken();
      const providerId =
        providerData?.id || providerData?._id || decoded?.id;

      if (!providerId) {
        toast.error("Provider ID not found. Please login again.");
        setAppointments([]);
        return;
      }

      const res = await getProviderAppointments(providerId);
      setAppointments(res?.data?.appointments || []);
    } catch {
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = (id: string, status: string) => {
    setAppointments(prev =>
      prev.map(a => (a._id === id ? { ...a, status } : a))
    );
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAppointment(id);
      updateStatus(id, "approved");
      toast.success("Appointment approved");
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (appt: Appointment) => {
    try {
      await rejectAppointment(appt._id);

      if (typeof appt.providerId !== "string") {
        await api.put(`/admin/${appt.providerId._id}/unlock-slot`, {
          date: appt.start.slice(0, 10),
          slotTime: `${new Date(appt.start)
            .toTimeString()
            .slice(0, 5)} - ${new Date(appt.end)
              .toTimeString()
              .slice(0, 5)}`,
        });
      }

      updateStatus(appt._id, "rejected");
      toast.success("Rejected & slot unlocked");
    } catch {
      toast.error("Reject failed");
    }
  };

  const resolveProviderId = (appt: Appointment) => {
    const fromAppointment =
      typeof appt.providerId === "string" ? appt.providerId : appt.providerId?._id;
    if (fromAppointment) return fromAppointment;

    const providerData = getProvider();
    const decoded = getDecodedToken();
    return providerData?.id || providerData?._id || decoded?.id || "";
  };

  const fetchRescheduleSlots = async (appt: Appointment, date: string) => {
    if (!date) {
      setRescheduleSlots([]);
      return;
    }

    const providerId = resolveProviderId(appt);
    if (!providerId) {
      toast.error("Provider ID not found for slot lookup");
      setRescheduleSlots([]);
      return;
    }

    try {
      setLoadingRescheduleSlots(true);
      const res = await api.get(`/providers/${providerId}/slots`, {
        params: { date },
      });

      const slots: ProviderSlot[] = Array.isArray(res?.data?.slots) ? res.data.slots : [];
      const availableTimes = slots
        .filter(
          (slot) =>
            slot?.isAvailable &&
            !slot?.isBooked &&
            typeof slot?.time === "string" &&
            !isPastSlot(date, slot.time)
        )
        .map((slot) => slot.time);

      setRescheduleSlots(availableTimes);
      if (!availableTimes.includes(selectedRescheduleSlot)) {
        setSelectedRescheduleSlot("");
      }
    } catch {
      toast.error("Failed to load slots for selected date");
      setRescheduleSlots([]);
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleOpenReschedule = async (appt: Appointment) => {
    const defaultDate = formatDateInput(appt.start);
    setRescheduleId(appt._id);
    setRescheduleDate(defaultDate);
    setSelectedRescheduleSlot("");
    setRescheduleSlots([]);
    await fetchRescheduleSlots(appt, defaultDate);
  };

  const closeReschedule = () => {
    setRescheduleId(null);
    setRescheduleDate("");
    setSelectedRescheduleSlot("");
    setRescheduleSlots([]);
  };

  const handleRescheduleSave = async (appt: Appointment) => {
    if (!rescheduleDate || !selectedRescheduleSlot) {
      toast.error("Pick a date and slot");
      return;
    }

    const [startStr, endStr] = selectedRescheduleSlot.split(" - ");
    const start = new Date(`${rescheduleDate}T${startStr}:00`);
    const end = new Date(`${rescheduleDate}T${endStr}:00`);

    if (start < new Date()) {
      toast.error("Cannot reschedule to past slot");
      return;
    }

    if (!window.confirm("Reschedule to selected slot?")) return;

    try {
      await rescheduleAppointment(appt._id, {
        start: start.toISOString(),
        end: end.toISOString(),
      });

      setAppointments(prev =>
        prev.map(a =>
          a._id === appt._id
            ? { ...a, start: start.toISOString(), end: end.toISOString() }
            : a
        )
      );

      toast.success("Rescheduled successfully");
      closeReschedule();
    } catch (err: any) {
      const responseData = err?.response?.data;
      console.error("Reschedule error:", {
        status: err?.response?.status,
        data: responseData,
        message: err?.message,
      });
      const message =
        responseData?.message ||
        responseData?.error ||
        err?.message ||
        "Failed to reschedule";
      toast.error(message);
    }
  };

  if (loading)
    return (
      <p className="text-center py-10 text-gray-500 dark:text-gray-400">
        Loading...
      </p>
    );

  if (!appointments.length)
    return (
      <p className="text-center py-10 text-gray-500 dark:text-gray-400">
        No appointments
      </p>
    );

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredAppointments = normalizedQuery
    ? appointments.filter((appt) => {
      const userName =
        typeof appt.userId === "string" ? appt.userId : appt.userId?.name || "";
      const providerName =
        typeof appt.providerId === "string"
          ? appt.providerId
          : appt.providerId?.name || "";
      const startText = new Date(appt.start).toLocaleString();
      const endText = new Date(appt.end).toLocaleString();
      const status = appt.status || "";

      const haystack = [
        userName,
        providerName,
        startText,
        endText,
        status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    : appointments;

  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-neutral-950">
      <div
        className="rounded-2xl border shadow-sm p-4 sm:p-6
        bg-white dark:bg-neutral-900
        border-gray-200 dark:border-neutral-800
        text-gray-900 dark:text-gray-200"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Appointments</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              approve, or reject appointment requests.
            </p>
          </div>
          <div className="w-full md:w-80">
            <label className="sr-only" htmlFor="appointmentSearch">
              Search appointments
            </label>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="appointmentSearch"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user, status, or date"
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-900 shadow-sm
                placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {["User", "Start", "End", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-sm font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map(appt => (
                <Fragment key={appt._id}>
                  <tr
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-4 py-3">
                      {typeof appt.userId === "string"
                        ? appt.userId
                        : appt.userId?.name}
                    </td>

                    <td className="px-4 py-3">
                      {new Date(appt.start).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      {new Date(appt.end).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 font-semibold capitalize">
                      <span
                        className={
                          appt.status === "approved"
                            ? "text-green-600 dark:text-green-400"
                            : appt.status === "rejected"
                              ? "text-red-600 dark:text-red-400"
                              : appt.status === "pending"
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-gray-400 dark:text-gray-500"
                        }
                      >
                        {appt.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {(appt.status === "pending" || appt.status === "missed") && (
                        <div className="flex gap-2">

                          {/* Approve - only for pending */}
                          {appt.status === "pending" && (
                            <button
                              onClick={() => handleApprove(appt._id)}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-green-500 hover:bg-green-600 text-white"
                              aria-label="Approve appointment"
                              title="Approve appointment"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}

                          {/* Reject - allowed for both */}
                          <button
                            onClick={() => handleReject(appt)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white"
                            aria-label="Reject appointment"
                            title="Reject appointment"
                          >
                            <XCircle size={18} />
                          </button>

                          {/* Reschedule - allowed for both */}
                          <button
                            onClick={() => handleOpenReschedule(appt)}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                            aria-label="Reschedule appointment"
                            title="Reschedule appointment"
                          >
                            <Clock size={18} />
                          </button>

                        </div>
                      )}

                    </td>
                  </tr>

                  {rescheduleId === appt._id && (
                    <tr className="bg-blue-50/60 dark:bg-blue-950/20">
                      <td className="px-4 py-4" colSpan={5}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              Date
                            </label>
                            <input
                              type="date"
                              value={rescheduleDate}
                              min={formatDateInput(new Date())}
                              onChange={async (e) => {
                                const nextDate = e.target.value;
                                setRescheduleDate(nextDate);
                                setSelectedRescheduleSlot("");
                                await fetchRescheduleSlots(appt, nextDate);
                              }}
                              className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="flex flex-col gap-1 min-w-[240px]">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              Available Slots
                            </label>
                            <select
                              value={selectedRescheduleSlot}
                              onChange={(e) => setSelectedRescheduleSlot(e.target.value)}
                              disabled={loadingRescheduleSlots || rescheduleSlots.length === 0}
                              className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                            >
                              <option value="">
                                {loadingRescheduleSlots
                                  ? "Loading slots..."
                                  : rescheduleSlots.length
                                    ? "Select a slot"
                                    : "No slots available"}
                              </option>
                              {rescheduleSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {slot}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRescheduleSave(appt)}
                              disabled={loadingRescheduleSlots || !selectedRescheduleSlot}
                              className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={closeReschedule}
                              className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>

          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No appointments match your search.
          </div>
        )}
      </div>
    </div>
  );
}
