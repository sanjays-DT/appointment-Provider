"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import AuthLayout from "./AuthLayout";
import { Mail, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = (emailToCheck: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get("/auth/forgot-password/check", {
          params: { email: emailToCheck, role: "provider" },
        });
        if (res.data?.status === "APPROVED") {
          if (pollRef.current) clearInterval(pollRef.current);
          setPolling(false);
          router.push(`/reset-password?email=${encodeURIComponent(emailToCheck)}`);
        }
      } catch {
        // keep polling quietly
      }
    }, 10000);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/forgot-password", {
        email,
        role: "provider",
      });

      if (res.status >= 400) {
        setError(res.data?.message || "Something went wrong");
      } else {
        setMessage(res.data?.message || "Request submitted");
        startPolling(email);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-1">
        Forgot Password
      </h2>
      <p className="text-sm text-muted-light dark:text-muted-dark mb-6">
        Submit your request and wait for admin approval.
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {polling && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Waiting for admin approval...
        </div>
      )}
      {message && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-primary hover:underline font-medium">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
