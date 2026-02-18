'use client';

import { useEffect, useMemo, useState } from "react";
import { Provider } from "@/types/provider";
import { createProvider, getProvider, getProviderAvatarURL, updateProvider } from "@/services/providerService";
import { getCategories } from "@/services/categoryService";
import { toast } from "react-toastify";
import { BASE_URL } from "@/lib/axios";
import { getDecodedToken, getProvider as getStoredProvider } from "@/lib/auth";
import { Pencil, Save, ArrowLeft, User, Camera } from "lucide-react";

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
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [initialPreview, setInitialPreview] = useState<string>("");
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

  /** Fetch categories */
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

  /** Get provider id */
  useEffect(() => {
    const stored = getStoredProvider();
    const decoded = getDecodedToken();
    const id = stored?.id || stored?._id || decoded?.id || null;
    setProviderId(id);
  }, []);

  /** Fetch provider data */
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

        const avatarURL = getProviderAvatarURL(providerId, BASE_URL);
        setPreview(avatarURL);
        setInitialPreview(avatarURL);
      } catch {
        toast.error("Failed to fetch provider");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  /** Form change handler */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourlyPrice" ? (value === "" ? "" : Number(value)) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /** Avatar change handler */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  /** Revoke blob URL on cleanup */
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /** Form validation */
  const validateForm = () => {
    const newErrors: ProviderFormErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.speciality?.trim()) newErrors.speciality = "Speciality is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (formData.hourlyPrice === "" || formData.hourlyPrice <= 0) newErrors.hourlyPrice = "Hourly price must be greater than 0";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Submit handler */
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
      setInitialPreview(preview);
      setAvatarFile(null);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save provider");
    } finally {
      setLoading(false);
    }
  };

  const formDisabled = loading || initialLoading || !providerId || !isEditing;

  const statusMessage = useMemo(() => {
    if (initialLoading) return "Loading profile...";
    if (!providerId) return "Provider profile not found. Please login again.";
    return "";
  }, [initialLoading, providerId]);

  return (
    <div className="h-[520px] flex justify-center items-center bg-slate-100 dark:bg-neutral-950 px-4 relative top-6">
      <div className="w-full max-w-4xl h-full bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden flex">

        {/* LEFT SIDE - FULL IMAGE */}
        <div className="w-1/3 h-full relative flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-neutral-800 flex items-center justify-center">
              <User size={60} className="text-white/70" />
            </div>
          )}

          {isEditing && (
            <label
              htmlFor="avatarUpload"
              className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer"
            >
              <Camera size={22} className="text-white" />
            </label>
          )}

          <input
            id="avatarUpload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            disabled={formDisabled}
          />
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="w-2/3 h-full p-6 flex flex-col justify-between overflow-hidden">

          {statusMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-5">
            {/* Basic Info */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-slate-900 dark:text-gray-100">Basic Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  disabled={formDisabled}
                  className={fieldClass(!!errors.name, formDisabled)}
                />
                <input
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  placeholder="Speciality"
                  disabled={formDisabled}
                  className={fieldClass(!!errors.speciality, formDisabled)}
                />
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  disabled={formDisabled}
                  className={fieldClass(!!errors.city, formDisabled)}
                />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  disabled={formDisabled}
                  className={fieldClass(!!errors.address, formDisabled)}
                />
              </div>
            </div>

            {/* Pricing & Category */}
            <div>
              <h3 className="text-md font-semibold mb-3 text-slate-900 dark:text-gray-100">Pricing & Category</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="hourlyPrice"
                  value={formData.hourlyPrice}
                  onChange={handleChange}
                  placeholder="Hourly Price"
                  disabled={formDisabled}
                  className={fieldClass(!!errors.hourlyPrice, formDisabled)}
                />
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={formDisabled}
                  className={fieldClass(!!errors.categoryId, formDisabled)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-md font-semibold mb-2 text-slate-900 dark:text-gray-100">Bio</h3>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell clients about yourself..."
                disabled={formDisabled}
                className={`${fieldClass(false, formDisabled)} resize-none`}
              />
            </div>
          </form>

          {/* Buttons */}
          <div className="flex justify-center gap-4 pt-4 border-t border-slate-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                if (!isEditing) return;
                if (initialFormData) {
                  setFormData(initialFormData);
                  setErrors({});
                  setAvatarFile(null);
                  setPreview(initialPreview); // <-- restore old image
                }
                setIsEditing(false);
              }}
              disabled={!isEditing}
              className="p-2 rounded-lg bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-gray-200 hover:bg-slate-300 transition"
              title="Cancel"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
              className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
              title="Edit"
            >
              <Pencil size={18} />
            </button>

            <button
              type="submit"
              disabled={formDisabled}
              className="p-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
              title="Save Changes"
            >
              {loading ? "..." : <Save size={18} />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function fieldClass(hasError: boolean, disabled: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm transition-all duration-150",
    "bg-white dark:bg-neutral-900 text-slate-900 dark:text-gray-100 placeholder:text-slate-400 dark:placeholder:text-gray-500",
    "focus:outline-none focus:ring-2 focus:ring-offset-1",
    hasError
      ? "border-destructive focus:ring-destructive/30"
      : "border-slate-300 dark:border-neutral-700 focus:ring-blue-200 dark:focus:ring-blue-900/60 focus:border-blue-400 dark:focus:border-blue-500",
    disabled ? "opacity-60 cursor-not-allowed" : "",
  ].join(" ");
}
