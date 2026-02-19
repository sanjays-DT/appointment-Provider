"use client";
export default function AppointmentsPage() {
  return (
    <div className="rounded-xl bg-white dark:bg-neutral-900 p-6 shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Appointments</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="py-2">Client</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i} className="border-t border-gray-200 dark:border-neutral-800">
              <td className="py-3 text-gray-900 dark:text-white">John Doe</td>
              <td className="text-gray-600 dark:text-gray-400">12 Feb 2026</td>
              <td className="text-gray-600 dark:text-gray-400">10:00 AM</td>
              <td>
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  Confirmed
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
