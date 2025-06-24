import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  videoFile: z.any(),
  thumbnail: z.any().optional(),
});

export default function UploadVideo() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(uploadSchema),
  });

  const videoFile = watch("videoFile");
  const thumbnail = watch("thumbnail");

  useEffect(() => {
    if (videoFile && videoFile[0]) {
      setVideoPreview(URL.createObjectURL(videoFile[0]));
    } else {
      setVideoPreview(null);
    }
  }, [videoFile]);

  useEffect(() => {
    if (thumbnail && thumbnail[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setThumbPreview(e.target.result);
      reader.readAsDataURL(thumbnail[0]);
    } else {
      setThumbPreview(null);
    }
  }, [thumbnail]);

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      if (data.videoFile && data.videoFile[0])
        formData.append("videoFile", data.videoFile[0]);
      if (data.thumbnail && data.thumbnail[0])
        formData.append("thumbnail", data.thumbnail[0]);
      formData.append("isPublic", isPublic);
      await api.post("/video/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Video uploaded successfully!");
      reset();
      setVideoPreview(null);
      setThumbPreview(null);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl rounded-lg shadow-lg overflow-hidden bg-card border border-border p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-background">
          <h2 className="text-2xl font-bold text-card-foreground">Upload Video</h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic((v) => !v)}
                className="accent-primary w-4 h-4 rounded"
              />
              <span>{isPublic ? "Public" : "Private"}</span>
            </label>
            <Button
              type="submit"
              form="upload-video-form"
              className="ml-2"
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
        </div>
        {/* Main Form */}
        <form
          id="upload-video-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8 px-8 py-8"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Enter video title"
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Enter video description"
              rows={4}
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          {/* Video & Thumbnail Selectors Side by Side */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Video File Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-card-foreground mb-2">Video File <span className="text-destructive">*</span></label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md bg-input cursor-pointer transition-colors hover:border-primary min-h-[180px] w-full p-4">
                {videoPreview ? (
                  <video src={videoPreview} controls className="w-full h-32 object-contain rounded mb-2" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-sm text-muted-foreground">Drag & drop or click to select video</span>
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  {...register("videoFile")}
                  className="hidden"
                />
              </label>
              {errors.videoFile && <p className="mt-1 text-sm text-destructive">{errors.videoFile.message}</p>}
            </div>
            {/* Thumbnail Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-card-foreground mb-2">Thumbnail</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md bg-input cursor-pointer transition-colors hover:border-primary min-h-[180px] w-full p-4">
                {thumbPreview ? (
                  <img src={thumbPreview} alt="Thumbnail preview" className="w-full h-32 object-cover rounded mb-2" />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span className="text-sm text-muted-foreground">Drag & drop or click to select thumbnail</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  {...register("thumbnail")}
                  className="hidden"
                />
              </label>
              {errors.thumbnail && <p className="mt-1 text-sm text-destructive">{errors.thumbnail.message}</p>}
            </div>
          </div>
          {/* Add to your playlists (placeholder) */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Add to your playlists
            </label>
            <div className="w-full px-3 py-2 border border-dashed border-border rounded-md bg-muted text-muted-foreground text-center">
              (Coming soon)
            </div>
          </div>
          {/* Error/Success */}
          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">{error}</div>}
          {success && <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-primary">{success}</div>}
          
        </form>
      </div>
    </div>
  );
}