import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  videoFile: z.any(),
  thumbnail: z.any(),
});

export default function UploadVideo() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

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

  // Previews
  useState(() => {
    if (videoFile && videoFile[0]) {
      setVideoPreview(URL.createObjectURL(videoFile[0]));
    }
  }, [videoFile]);
  useState(() => {
    if (thumbnail && thumbnail[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setThumbPreview(e.target.result);
      reader.readAsDataURL(thumbnail[0]);
    }
  }, [thumbnail]);

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (data.videoFile && data.videoFile[0]) formData.append("videoFile", data.videoFile[0]);
      if (data.thumbnail && data.thumbnail[0]) formData.append("thumbnail", data.thumbnail[0]);
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-card-foreground mb-6">Upload Video</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Title</label>
              <input
                type="text"
                {...register("title")}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter video title"
              />
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Description</label>
              <textarea
                {...register("description")}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                placeholder="Enter video description"
                rows={4}
              />
              {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Video File</label>
              <input
                type="file"
                accept="video/*"
                {...register("videoFile")}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              {videoPreview && (
                <video src={videoPreview} controls className="w-full mt-2 rounded-md" />
              )}
              {errors.videoFile && <p className="mt-1 text-sm text-destructive">{errors.videoFile.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                {...register("thumbnail")}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-input-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              {thumbPreview && (
                <img src={thumbPreview} alt="Thumbnail preview" className="w-32 h-20 object-cover mt-2 rounded-md border border-border" />
              )}
              {errors.thumbnail && <p className="mt-1 text-sm text-destructive">{errors.thumbnail.message}</p>}
            </div>
            {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">{error}</div>}
            {success && <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-primary">{success}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Uploading..." : "Upload Video"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 