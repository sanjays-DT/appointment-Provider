"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getCategories } from "@/services/categoryService";
import { registerProvider } from "@/services/auth.service";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Briefcase,
  IndianRupee,
} from "lucide-react";
import { validateProvider } from "@/utils/validation";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
}

export default function ProviderRegisterForm() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    categoryId: "",
    speciality: "",
    city: "",
    hourlyPrice: "",
    address: "",
  });

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    getCategories()
      .then((res) => {
        const list = res?.data?.categories || res?.data || [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  /* ================= INPUT ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ================= AVATAR ================= */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, avatar: "Only image files allowed" }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, avatar: "Image must be under 2MB" }));
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setErrors((p) => ({ ...p, avatar: "" }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateProvider(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (avatar) payload.append("avatar", avatar);

      await registerProvider(payload as any);
      toast.success("Registration successful! Await admin approval.");
      router.push("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className=" grid grid-cols-1 md:grid-cols-2 bg-background-light dark:bg-background-dark ">

      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <h1 className="text-4xl font-extrabold">Provider Onboarding</h1>
      </div>

      <div className="flex items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl relative -top-4 rounded-3xl p-8 space-y-5 bg-surface-light dark:bg-surface-dark"
        >
          <h2 className="text-3xl font-bold">Register as Provider</h2>

          {/* AVATAR */}
          <div>
            <label className="cursor-pointer text-primary text-sm">
              Upload Photo
              <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
            {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar}</p>}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconInput icon={<User size={18} />} name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Full Name" />
            <IconInput icon={<Mail size={18} />} name="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="Email" />
            <IconPassword value={form.password} show={showPassword} toggle={() => setShowPassword(!showPassword)} onChange={handleChange} error={errors.password} />
            <IconInput icon={<Briefcase size={18} />} name="speciality" value={form.speciality} onChange={handleChange} error={errors.speciality} placeholder="Speciality" />
            <IconInput icon={<MapPin size={18} />} name="city" value={form.city} onChange={handleChange} error={errors.city} placeholder="City" />
            <IconInput icon={<IndianRupee size={18} />} name="hourlyPrice" value={form.hourlyPrice} onChange={handleChange} error={errors.hourlyPrice} placeholder="Hourly Price" type="number" />
          </div>

          {/* ADDRESS */}
          <IconInput icon={<MapPin size={18} />} name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="Address" />

          {/* CATEGORY */}
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className={`w-full py-3 px-4 rounded-xl border ${errors.categoryId ? "border-red-500" : ""}`}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId}</p>}

          <button disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            {loading ? "Registering..." : "Register Provider"}
          </button>
          <p className="text-center relative -top-4 text-sm text-muted-light dark:text-muted-dark mt-6"> Already have an account?{" "} <Link href="/" className="text-primary font-medium hover:underline" > Sign in </Link> </p>
        </form>
      </div>
    </div>
  );
}

/* ================= INPUT COMPONENTS ================= */
function IconInput({ icon, error, ...props }: any) {
  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        <input
          {...props}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-transparent
            ${error ? "border-red-500" : ""}
          `}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

function IconPassword({ value, show, toggle, onChange, error }: any) {
  return (
    <div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
        <input
          name="password"
          value={value}
          type={show ? "text" : "password"}
          onChange={onChange}
          placeholder="Password"
          className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-transparent
            ${error ? "border-red-500" : ""}
          `}
        />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
