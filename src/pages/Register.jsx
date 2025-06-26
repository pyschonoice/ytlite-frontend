// src/pages/Register.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { useState, useEffect } from "react"; // <-- Import useEffect
import { Eye, EyeOff, UserPlus, Upload } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.any().refine(files => files?.length > 0, "Avatar is required."), // Make avatar required
  coverImage: z.any().optional(),
});

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const avatarFile = watch("avatar");
  const coverFile = watch("coverImage");

  // --- FIX: Changed useState to useEffect ---
  // This effect runs whenever the 'avatarFile' (from react-hook-form) changes.
  useEffect(() => {
    if (avatarFile && avatarFile[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result); // Set the preview state when file is read
      reader.readAsDataURL(avatarFile[0]);
    } else {
      setAvatarPreview(null); // Clear preview if no file is selected
    }
  }, [avatarFile]);

  // --- FIX: Changed useState to useEffect ---
  // This effect runs whenever the 'coverFile' changes.
  useEffect(() => {
    if (coverFile && coverFile[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(coverFile[0]);
    } else {
      setCoverPreview(null); // Clear preview if no file is selected
    }
  }, [coverFile]);

  const onSubmit = async (data) => {
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (data.avatar && data.avatar[0]) {
        formData.append("avatar", data.avatar[0]);
      }
      if (data.coverImage && data.coverImage[0]) {
        formData.append("coverImage", data.coverImage[0]);
      }
      const res = await api.post("/user/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // After successful registration, the backend should ideally log the user in
      // and set the cookies. A hard refresh forces the AuthContext to re-check for the user.
      // A smoother alternative would be to call login() from AuthContext and then navigate.
      // For now, this works.
      window.location.href = "/";
    } catch (err) {
      // Show backend validation errors if present
      if (err?.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.msg).join(" | "));
      } else {
        setError(err?.response?.data?.message || "Registration failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-background overflow-none m-0 p-0 ">
      <div className="w-full max-w-xl ">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6 sm:p-10">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground">Create account</h2>
            <p className="text-muted-foreground mt-2">Join ytlite today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                {...register("fullName")}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                {...register("username")}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-input text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Avatar and Cover Image Selectors Side by Side */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-card-foreground mb-2">Avatar <span className="text-destructive">*</span></label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md bg-input cursor-pointer transition-colors hover:border-primary min-h-[140px] w-full p-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 object-cover rounded-full border border-border mb-2" />
                  ) : (
                    <>
                      <UserPlus className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Drag & drop or click to select avatar</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    {...register("avatar")}
                    className="hidden"
                  />
                </label>
                {errors.avatar && <p className="mt-1 text-sm text-destructive">{errors.avatar.message}</p>}
              </div>
              {/* Cover Image Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-card-foreground mb-2">Cover Image</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md bg-input cursor-pointer transition-colors hover:border-primary min-h-[140px] w-full p-4">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-20 object-cover rounded mb-2" />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Drag & drop or click to select cover image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    {...register("coverImage")}
                    className="hidden"
                  />
                </label>
                {errors.coverImage && <p className="mt-1 text-sm text-destructive">{errors.coverImage.message}</p>}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}