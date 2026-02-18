"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { bufferToImage } from "@/lib/image";
import { BASE_URL } from "@/lib/axios";
import { getProviderAvatarURL } from "@/services/providerService";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { provider, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  /* ================= AVATAR (BUFFER + URL SUPPORT) ================= */
  const avatarFromBuffer = useMemo(() => {
    if (!provider?.avatar) return null;
    return bufferToImage(provider.avatar);
  }, [provider?.avatar]);

  useEffect(() => {
    return () => {
      if (avatarFromBuffer) URL.revokeObjectURL(avatarFromBuffer);
    };
  }, [avatarFromBuffer]);

  const avatarSrc =
    avatarFromBuffer ||
    (provider?.id ? getProviderAvatarURL(provider.id, BASE_URL) : null) ||
    "/default-avatar.png";

  return (
    <header
      className="
        sticky top-0 z-30
        flex justify-between items-center
        bg-white/90 dark:bg-neutral-900/90 backdrop-blur
        px-4 sm:px-6 py-4
        border-b border-gray-200/80 dark:border-neutral-800/80
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
              h-9 w-9 inline-flex items-center justify-center rounded-lg
              text-gray-700 dark:text-gray-300
              hover:text-white hover:bg-blue-600
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            "
            aria-label="Login"
            title="Login"
          >
            <LogIn size={18} />
          </Link>

          <Link
            href="/register"
            className="
              h-9 w-9 inline-flex items-center justify-center rounded-lg
              text-gray-700 dark:text-gray-300
              hover:text-white hover:bg-blue-600
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            "
            aria-label="Register"
            title="Register"
          >
            <UserPlus size={18} />
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
              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-neutral-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {provider?.name}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="
              h-9 w-9 inline-flex items-center justify-center rounded-lg
              bg-red-500 hover:bg-red-600
              text-white text-sm font-medium transition
            "
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
          </button>

          <button
            onClick={toggleTheme}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>

        </div>
      )}
    </header>
  );
}
