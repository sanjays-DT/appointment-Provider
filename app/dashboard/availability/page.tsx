"use client";
export default function AvailabilityPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white dark:bg-neutral-900 p-6 shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Weekly Availability</h2>
        {["Monday", "Tuesday", "Wednesday"].map((day) => (
          <div key={day} className="flex justify-between mb-3">
            <span className="text-gray-700 dark:text-gray-300">{day}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">09:00 - 17:00</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white dark:bg-neutral-900 p-6 shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Unavailable Dates</h2>
        <div className="flex gap-2 flex-wrap">
          {["14 Feb", "20 Feb"].map((date) => (
            <span key={date} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
              {date}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
