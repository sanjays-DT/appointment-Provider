"use client";
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { title: "Total Appointments", value: "124" },
        { title: "This Week", value: "18" },
        { title: "Cancelled", value: "4" },
      ].map((card) => (
        <div key={card.title} className="rounded-xl bg-white dark:bg-neutral-900 p-6 shadow">
          <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</h2>
        </div>
      ))}

      {/* Chart placeholder */}
      <div className="md:col-span-3 rounded-xl bg-white dark:bg-neutral-900 p-6 shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Weekly Bookings</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">📊 Chart goes here</div>
      </div>
    </div>
  );
}
