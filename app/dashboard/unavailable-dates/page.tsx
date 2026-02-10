"use client";
import { Ban } from "lucide-react";

export default function UnavailableDatesPage() {
  const blockedDates = ["2026-02-14", "2026-02-20"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 px-4 sm:px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-red-50 text-red-600 inline-flex items-center justify-center dark:bg-red-500/10 dark:text-red-400">
              <Ban size={18} />
            </span>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Block Dates / Leave
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View days you are unavailable for appointments.
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm border border-gray-200 dark:border-neutral-800">
          {blockedDates.length ? (
            <div className="flex gap-2 flex-wrap">
              {blockedDates.map((date) => (
                <span
                  key={date}
                  className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm dark:bg-red-900/30 dark:text-red-300"
                >
                  {date}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No blocked dates yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
