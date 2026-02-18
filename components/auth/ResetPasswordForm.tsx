"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import AuthLayout from "./AuthLayout";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password/reset", {
        email,
        password,
        role: "provider",
      });
      toast.success("Password updated successfully. Please login.");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-1">
        Reset Password
      </h2>
      <p className="text-sm text-muted-light dark:text-muted-dark mb-6">
        Create a new secure password for your account.
      </p>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
          />
          <input
            type="email"
            placeholder="Registered email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-transparent focus:ring-2 focus:ring-primary outline-none"
            required
          />
        </div>

        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
          />
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-transparent focus:ring-2 focus:ring-primary outline-none"
            required
          />
        </div>

        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light dark:border-border-dark bg-transparent focus:ring-2 focus:ring-primary outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-primary hover:underline font-medium">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
