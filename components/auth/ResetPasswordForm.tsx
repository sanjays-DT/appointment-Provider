"use client";

import { useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
          Reset Password
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          Create a new secure password
        </p>

        <form className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />

          <button className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-2 text-white font-medium">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
