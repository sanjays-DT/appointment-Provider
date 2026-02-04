"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { bufferToImage } from "@/lib/image";

export default function Navbar() {
  const { provider, isAuthenticated, logout } = useAuth();

  /* ================= AVATAR (BUFFER SUPPORT) ================= */
   const avatarSrc =
    provider && provider.id
      ? `http://localhost:5000/api/providers/${provider.id}/avatar`
      : "/default-avatar.png";

  return (
    <header
      className="
        flex justify-between items-center
        bg-white dark:bg-neutral-900
        px-6 py-4
        border-b border-gray-200 dark:border-neutral-800
      "
    >
      {/* ================= LEFT ================= */}
      <div className="text-lg font-semibold text-gray-900 dark:text-white">
        Provider Dashboard
      </div>

      {/* ================= RIGHT ================= */}
      {!isAuthenticated ? (
        /* ===== BEFORE LOGIN ===== */
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="
              text-sm font-medium
              text-gray-700 dark:text-gray-300
              hover:text-blue-600
            "
          >
            Login
          </Link>

          <Link
            href="/register"
            className="
              px-4 py-2 rounded-lg
              bg-blue-600 hover:bg-blue-700
              text-white text-sm font-semibold
            "
          >
            Register
          </Link>
        </div>
      ) : (
        /* ===== AFTER LOGIN ===== */
        <div className="flex items-center gap-4">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <img
              src={avatarSrc || "/avatar.png"}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {provider?.name}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="
              px-4 py-2 rounded-lg
              bg-red-500 hover:bg-red-600
              text-white text-sm font-medium transition
            "
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
