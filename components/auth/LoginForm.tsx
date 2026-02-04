"use client";

import { useState } from "react";
import { loginProvider } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import AuthLayout from "./AuthLayout";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { validateLogin } from "@/utils/validation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const { login } = useAuth();

  /* ================= SUBMIT ================= */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateLogin(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await loginProvider({ email, password });

      login(data.token, data.provider);
      toast.success("Login successful");
      router.replace("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-1">
        Sign In
      </h2>
      <p className="text-sm text-muted-light dark:text-muted-dark mb-6">
        Access your account securely
      </p>

      <form onSubmit={submit} className="space-y-5">

        {/* EMAIL */}
        <div>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2
              text-muted-light dark:text-muted-dark"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: "" }));
              }}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent
                ${errors.email ? "border-red-500" : "border-border-light dark:border-border-dark"}
                focus:ring-2 focus:ring-primary outline-none`}
            />
          </div>

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2
              text-muted-light dark:text-muted-dark"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: "" }));
              }}
              className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-transparent
                ${errors.password ? "border-red-500" : "border-border-light dark:border-border-dark"}
                focus:ring-2 focus:ring-primary outline-none`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2
              text-muted-light dark:text-muted-dark"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* FORGOT */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl
            bg-gradient-to-r from-blue-600 to-indigo-600
            text-white font-semibold hover:opacity-95
            transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {/* REGISTER */}
        <p className="text-center text-sm text-muted-light dark:text-muted-dark mt-6">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
