"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 shadow-xl p-8">
        <h1 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
          Forgot Password
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
          Reset provider account password
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-transparent px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 py-2 text-white font-medium disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        {polling && (
          <p className="mt-3 text-sm text-blue-600 text-center">
            Waiting for admin approval...
          </p>
        )}
        {message && (
          <p className="mt-3 text-sm text-green-600 text-center">{message}</p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
        )}

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
