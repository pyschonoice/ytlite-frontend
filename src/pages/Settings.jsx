// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../components/ui/button";
import { Eye, EyeOff, User, LockKeyhole, Image, Upload } from "lucide-react"; // Added Image and Upload icons
import {
  updateUserDetails,
  changeUserPassword,
  updateUserAvatar, // New import
  updateUserCoverImage, // New import
} from "../services/api";
import ProgressModal from "../components/ProgressModal"; // For consistent feedback

// Schema for Update Account Details
const updateAccountSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(50, "Full name cannot exceed 50 characters"),
  email: z.string().email("Invalid email address"),
});

// Schema for Change Password
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(1, "Confirm new password is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});

// Schema for Update Avatar/Cover Image
const updateMediaSchema = z.object({
  avatar: z.any().optional(), // File object for new avatar
  coverImage: z.any().optional(), // File object for new cover image
}).refine((data) => data.avatar || data.coverImage, {
  message: "Please select an avatar or cover image to upload.",
  path: ["avatar"], // Can point to either
});


export default function Settings() {
  const { user, updateUser } = useAuth(); // Get user and updateUser from context

  const [activeTab, setActiveTab] = useState("profile"); // 'profile', 'password', or 'media'

  // States for ProgressModal feedback
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalTitle, setProgressModalTitle] = useState("");
  const [progressModalDescription, setProgressModalDescription] = useState("");
  const [progressModalVariant, setProgressModalVariant] = useState("loading");

  // State for password visibility
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // For media updates
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || null);
  const [coverPreview, setCoverPreview] = useState(user?.coverImage?.url || null);


  // Form for Update Account Details
  const {
    register: registerAccount,
    handleSubmit: handleAccountSubmit,
    formState: { errors: accountErrors, isSubmitting: isAccountSubmitting },
    reset: resetAccountForm,
  } = useForm({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  // Form for Change Password
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPasswordForm,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Form for Update Media
  const {
    register: registerMedia,
    handleSubmit: handleMediaSubmit,
    formState: { errors: mediaErrors, isSubmitting: isMediaSubmitting },
    watch: watchMedia,
    setValue: setMediaValue, // To clear file inputs manually
    reset: resetMediaForm,
  } = useForm({
    resolver: zodResolver(updateMediaSchema),
  });

  const newAvatarFile = watchMedia("avatar");
  const newCoverImageFile = watchMedia("coverImage");


  // Reset forms when user data changes or tab switches
  useEffect(() => {
    resetAccountForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
    });
    // Update media previews with current user's media
    setAvatarPreview(user?.avatar?.url || null);
    setCoverPreview(user?.coverImage?.url || null);
  }, [user, resetAccountForm]);

  useEffect(() => {
    resetPasswordForm();
    resetMediaForm(); // Also reset media form on tab change
    // Clear any selected files on tab change
    setMediaValue("avatar", null);
    setMediaValue("coverImage", null);
    setAvatarPreview(user?.avatar?.url || null); // Revert to current user's avatar
    setCoverPreview(user?.coverImage?.url || null); // Revert to current user's cover
  }, [activeTab, resetPasswordForm, resetMediaForm, setMediaValue, user]);


  // Effect for Avatar preview
  useEffect(() => {
    if (newAvatarFile && newAvatarFile[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(newAvatarFile[0]);
    } else if (activeTab === "media") { // Only reset if on the media tab
      setAvatarPreview(user?.avatar?.url || null);
    }
  }, [newAvatarFile, user, activeTab]);

  // Effect for Cover Image preview
  useEffect(() => {
    if (newCoverImageFile && newCoverImageFile[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(newCoverImageFile[0]);
    } else if (activeTab === "media") { // Only reset if on the media tab
      setCoverPreview(user?.coverImage?.url || null);
    }
  }, [newCoverImageFile, user, activeTab]);


  const onUpdateAccount = async (data) => {
    setShowProgressModal(true);
    setProgressModalTitle("Updating Profile...");
    setProgressModalDescription("Please wait while your details are being updated.");
    setProgressModalVariant("loading");

    try {
      const response = await updateUserDetails(data);
      updateUser(response.data); // Update AuthContext user state immediately
      setProgressModalTitle("Success!");
      setProgressModalDescription("Profile details updated successfully.");
      setProgressModalVariant("success");
      setTimeout(() => setShowProgressModal(false), 2000); // Close after 2s
    } catch (err) {
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || "Failed to update profile details.");
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000); // Close after 3s
      console.error("Update account failed:", err);
    }
  };

  const onChangePassword = async (data) => {
    setShowProgressModal(true);
    setProgressModalTitle("Changing Password...");
    setProgressModalDescription("Please wait while your password is being updated.");
    setProgressModalVariant("loading");

    try {
      await changeUserPassword(data);
      setProgressModalTitle("Success!");
      setProgressModalDescription("Password changed successfully.");
      setProgressModalVariant("success");
      resetPasswordForm(); // Clear password fields on success
      setTimeout(() => setShowProgressModal(false), 2000);
    } catch (err) {
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || "Failed to change password.");
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error("Change password failed:", err);
    }
  };

  const onUpdateMedia = async (data) => {
    setShowProgressModal(true);
    setProgressModalTitle("Updating Media...");
    setProgressModalDescription("Please wait while your images are being updated.");
    setProgressModalVariant("loading");

    try {
      if (data.avatar && data.avatar[0]) {
        const formData = new FormData();
        formData.append("avatar", data.avatar[0]);
        const response = await updateUserAvatar(formData);
        updateUser(response.data); // Update AuthContext user state with new avatar URL
      }

      if (data.coverImage && data.coverImage[0]) {
        const formData = new FormData();
        formData.append("coverImage", data.coverImage[0]);
        const response = await updateUserCoverImage(formData);
        updateUser(response.data); // Update AuthContext user state with new cover URL
      }

      setProgressModalTitle("Success!");
      setProgressModalDescription("Media updated successfully.");
      setProgressModalVariant("success");
      // Clear file inputs after successful upload
      setMediaValue("avatar", null);
      setMediaValue("coverImage", null);
      setTimeout(() => setShowProgressModal(false), 2000);
    } catch (err) {
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || "Failed to update media.");
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error("Update media failed:", err);
    }
  };


  return (
    <div className="min-h-full flex items-center justify-center bg-background overflow-none m-0 p-0 ">
      <div className="w-full max-w-xl">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6 sm:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">Account Settings</h2>
            <p className="text-muted-foreground mt-2">Manage your profile, password, and media</p>
          </div>

          <div className="flex justify-center mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 px-6 font-semibold text-base transition-colors border-b-2 ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`py-3 px-6 font-semibold text-base transition-colors border-b-2 ${
                activeTab === "password"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`py-3 px-6 font-semibold text-base transition-colors border-b-2 ${
                activeTab === "media"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Media
            </button>
          </div>

          {activeTab === "profile" && (
            <form onSubmit={handleAccountSubmit(onUpdateAccount)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  {...registerAccount("fullName")}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={isAccountSubmitting}
                />
                {accountErrors.fullName && (
                  <p className="mt-1 text-sm text-destructive">{accountErrors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  {...registerAccount("email")}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isAccountSubmitting}
                />
                {accountErrors.email && (
                  <p className="mt-1 text-sm text-destructive">{accountErrors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isAccountSubmitting}
                className="w-full"
              >
                {isAccountSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          )}

          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Old Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    {...registerPassword("oldPassword")}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Enter old password"
                    disabled={isPasswordSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isPasswordSubmitting}
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.oldPassword && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.oldPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...registerPassword("newPassword")}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Enter new password"
                    disabled={isPasswordSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isPasswordSubmitting}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    {...registerPassword("confirmNewPassword")}
                    className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Confirm new password"
                    disabled={isPasswordSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isPasswordSubmitting}
                  >
                    {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmNewPassword && (
                  <p className="mt-1 text-sm text-destructive">{passwordErrors.confirmNewPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isPasswordSubmitting}
                className="w-full"
              >
                {isPasswordSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          )}

          {activeTab === "media" && (
            <form onSubmit={handleMediaSubmit(onUpdateMedia)} className="space-y-6">
              {/* Avatar Selector */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Avatar</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md bg-input cursor-pointer transition-colors hover:border-primary min-h-[140px] w-full p-4">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-20 h-20 object-cover rounded-full border border-border mb-2" />
                  ) : (
                    <>
                      <User className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Drag & drop or click to select avatar</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    {...registerMedia("avatar")}
                    className="hidden"
                    disabled={isMediaSubmitting}
                  />
                </label>
                {mediaErrors.avatar && <p className="mt-1 text-sm text-destructive">{mediaErrors.avatar.message}</p>}
                <p className="mt-2 text-xs text-muted-foreground">Upload a new avatar. Current: <a href={user?.avatar?.url} target="_blank" rel="noopener noreferrer" className="underline">{user?.avatar?.url ? "View" : "None"}</a></p>
              </div>

              {/* Cover Image Selector */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Cover Image</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md bg-input cursor-pointer transition-colors hover:border-primary min-h-[140px] w-full p-4">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover preview" className="w-full h-20 object-cover rounded mb-2" />
                  ) : (
                    <>
                      <Image className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Drag & drop or click to select cover image</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    {...registerMedia("coverImage")}
                    className="hidden"
                    disabled={isMediaSubmitting}
                  />
                </label>
                {mediaErrors.coverImage && <p className="mt-1 text-sm text-destructive">{mediaErrors.coverImage.message}</p>}
                <p className="mt-2 text-xs text-muted-foreground">Upload a new cover image. Current: <a href={user?.coverImage?.url} target="_blank" rel="noopener noreferrer" className="underline">{user?.coverImage?.url ? "View" : "None"}</a></p>
              </div>

              <Button
                type="submit"
                disabled={isMediaSubmitting || (!newAvatarFile && !newCoverImageFile)}
                className="w-full"
              >
                {isMediaSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Update Media"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      <ProgressModal
        open={showProgressModal}
        title={progressModalTitle}
        description={progressModalDescription}
        variant={progressModalVariant}
      />
    </div>
  );
}