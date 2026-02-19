'use client';

import { useEffect, useMemo, useState } from "react";
import { Provider } from "@/types/provider";
import { createProvider, getProvider, updateProvider } from "@/services/providerService";
import { getCategories } from "@/services/categoryService";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getProviderAvatarURL } from "@/services/providerService";
import { BASE_URL } from "@/lib/axios";
import { getDecodedToken, getProvider as getStoredProvider } from "@/lib/auth";
import { Pencil, Save, ArrowLeft } from "lucide-react";

type ProviderFormState = {
  name: string;
  speciality: string;
  city: string;
  address: string;
  hourlyPrice: number | "";
  categoryId: string;
  bio: string;
};

type ProviderFormErrors = Partial<Record<keyof ProviderFormState, string>>;

export default function ProviderForm() {
  const router = useRouter();

  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [initialFormData, setInitialFormData] = useState<ProviderFormState | null>(null);

  const [formData, setFormData] = useState<ProviderFormState>({
    name: "",
    speciality: "",
    city: "",
    address: "",
    hourlyPrice: "",
    categoryId: "",
    bio: "",
  });

  const [errors, setErrors] = useState<ProviderFormErrors>({});
  const [title, setTitle] = useState("Profile");

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  /* ---------------- GET PROVIDER ID ---------------- */
  useEffect(() => {
    const stored = getStoredProvider();
    const decoded = getDecodedToken();
    const id = stored?.id || stored?._id || decoded?.id || null;
    setProviderId(id);
  }, []);

  /* ---------------- FETCH PROVIDER FOR EDIT ---------------- */
  useEffect(() => {
    if (!providerId) {
      setInitialLoading(false);
      return;
    }

    const fetchProvider = async () => {
      try {
        const data: Provider = await getProvider(providerId);
        const nextFormData: ProviderFormState = {
          name: data.name || "",
          speciality: data.speciality || "",
          city: data.city || "",
          address: data.address || "",
          hourlyPrice: data.hourlyPrice ?? "",
          categoryId:
            typeof data.categoryId === "object"
              ? (data.categoryId as any)._id
              : data.categoryId || "",
          bio: data.bio || "",
        };

        setFormData(nextFormData);
        setInitialFormData(nextFormData);

        setPreview(getProviderAvatarURL(providerId, BASE_URL));
      } catch {
        toast.error("Failed to fetch provider");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  /* ---------------- HANDLE INPUT CHANGE ---------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "hourlyPrice" ? (value === "" ? "" : Number(value)) : value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /* ---------------- HANDLE AVATAR CHANGE ---------------- */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* ---------------- VALIDATE FORM ---------------- */
  const validateForm = () => {
    const newErrors: ProviderFormErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.speciality?.trim()) newErrors.speciality = "Speciality is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (formData.hourlyPrice === "" || formData.hourlyPrice <= 0)
      newErrors.hourlyPrice = "Hourly price must be greater than 0";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLE SUBMIT ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditing) return;

    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("speciality", formData.speciality);
      data.append("city", formData.city);
      data.append("address", formData.address);
      data.append("hourlyPrice", String(formData.hourlyPrice || 0));
      data.append("bio", formData.bio || "");
      data.append("categoryId", formData.categoryId);

      if (avatarFile) data.append("avatar", avatarFile);

      if (providerId) {
        await updateProvider(providerId, data);
        toast.success("Provider updated successfully");
      } else {
        await createProvider(data);
        toast.success("Provider created successfully");
      }

      setInitialFormData(formData);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save provider");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI STYLES ---------------- */
  const input = `w-full rounded-xl border px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition
    border-gray-300 bg-white text-gray-800
    dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200
  `;

  const sectionHeader = `text-gray-800 dark:text-gray-100`;
  const formBg = `bg-white border-gray-200 text-gray-900 dark:bg-neutral-900 dark:border-neutral-800 dark:text-gray-200`;
  const pageBg = `bg-slate-50 dark:bg-neutral-950`;

  const formDisabled = loading || initialLoading || !providerId || !isEditing;
  const inputClass = (key: keyof ProviderFormState) =>
    `${input} ${errors[key] ? "border-red-500 focus:ring-red-500" : ""}`;

  const errorText = (key: keyof ProviderFormState) =>
    errors[key] ? <p className="text-red-500 text-sm mt-1">{errors[key]}</p> : null;

  const statusMessage = useMemo(() => {
    if (initialLoading) return "Loading profile...";
    if (!providerId) return "Provider profile not found. Please login again.";
    return "";
  }, [initialLoading, providerId]);

  return (
    <div className={`w-full px-4 sm:px-6 py-8 min-h-screen ${pageBg}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${sectionHeader}`}>{title}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage provider profile and pricing details
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={!providerId || initialLoading || loading || isEditing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
              bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Edit profile"
            >
              <Pencil size={16} />
              Edit
            </button>
          </div>
          {statusMessage && (
            <p className="mt-3 text-sm text-red-500">{statusMessage}</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl shadow-sm border p-8 space-y-8 ${formBg}`}
        >
          {/* BASIC INFO */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${sectionHeader}`}>
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  name="name"
                  placeholder="Provider name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className={inputClass("name")}
                  disabled={formDisabled}
                />
                {errorText("name")}
              </div>

              <div>
                <input
                  name="speciality"
                  placeholder="Speciality"
                  value={formData.speciality || ""}
                  onChange={handleChange}
                  className={inputClass("speciality")}
                  disabled={formDisabled}
                />
                {errorText("speciality")}
              </div>

              <div>
                <input
                  name="city"
                  placeholder="City"
                  value={formData.city || ""}
                  onChange={handleChange}
                  className={inputClass("city")}
                  disabled={formDisabled}
                />
                {errorText("city")}
              </div>

              <div>
                <input
                  name="address"
                  placeholder="Address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  className={inputClass("address")}
                  disabled={formDisabled}
                />
                {errorText("address")}
              </div>
            </div>
          </section>

          {/* PRICING */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${sectionHeader}`}>
              Pricing & Category
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <input
                  type="number"
                  name="hourlyPrice"
                  placeholder="Hourly Price"
                  value={formData.hourlyPrice ?? ""}
                  onChange={handleChange}
                  className={inputClass("hourlyPrice")}
                  disabled={formDisabled}
                />
                {errorText("hourlyPrice")}
              </div>

              <div>
                <select
                  name="categoryId"
                  value={formData.categoryId || ""}
                  onChange={handleChange}
                  className={inputClass("categoryId")}
                  disabled={formDisabled}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errorText("categoryId")}
              </div>
            </div>
          </section>

          {/* BIO */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${sectionHeader}`}>Bio</h3>
            <textarea
              name="bio"
              rows={4}
              placeholder="Short description about the provider"
              value={formData.bio || ""}
              onChange={handleChange}
              className={inputClass("bio")}
              disabled={formDisabled}
            />
          </section>

          {/* AVATAR */}
          <section>
            <h3 className={`text-lg font-semibold mb-4 ${sectionHeader}`}>
              Profile Picture
            </h3>

            <div className="flex items-center gap-6">
              {/* Preview */}
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover border shadow-sm border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border border-dashed flex items-center justify-center text-sm text-gray-400 border-gray-300 dark:text-gray-400 dark:border-gray-600">
                  No Image
                </div>
              )}

              {/* Upload control */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="avatarUpload"
                  className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl
                  bg-blue-600 text-white text-sm font-medium cursor-pointer
                  hover:bg-blue-700 transition shadow-sm
                  ${formDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Choose Image
                </label>

                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={formDisabled}
                />

                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {avatarFile ? avatarFile.name : "No file chosen"}
                </span>
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                if (!isEditing) {
                  router.push("/dashboard");
                  return;
                }
                if (initialFormData) {
                  setFormData(initialFormData);
                  setErrors({});
                  setAvatarFile(null);
                }
                setIsEditing(false);
              }}
              disabled={loading}
              className={`px-6 py-3 rounded-xl transition bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <span className="inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                {isEditing ? "Cancel" : "Back"}
              </span>
            </button>

            <button
              type="submit"
              disabled={formDisabled}
              className="h-12 w-12 rounded-xl transition bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 inline-flex items-center justify-center"
              aria-label="Save profile"
              title="Save profile"
            >
              {loading ? "..." : <Save size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
