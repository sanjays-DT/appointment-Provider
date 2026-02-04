"use client";
export default function UnavailableDatesPage() {
  return (
    <div className="rounded-xl bg-white dark:bg-neutral-900 p-6 shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Block Dates / Leave</h2>
      <div className="flex gap-2 flex-wrap">
        {["2026-02-14", "2026-02-20"].map((date) => (
          <span key={date} className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
            {date}
          </span>
        ))}
      </div>
    </div>
  );
}
