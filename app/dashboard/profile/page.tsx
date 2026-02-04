"use client";
export default function ProfilePage() {
  return (
    <div className="rounded-xl bg-white dark:bg-neutral-900 p-6 shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Provider Profile</h2>
      <div className="space-y-4">
        {["Name", "Email", "Speciality", "City", "Hourly Rate"].map((field) => (
          <div key={field} className="flex justify-between">
            <span className="text-gray-700 dark:text-gray-300">{field}</span>
            <span className="text-gray-900 dark:text-white">-</span>
          </div>
        ))}
      </div>
    </div>
  );
}
