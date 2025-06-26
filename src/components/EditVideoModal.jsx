// src/components/EditVideoModal.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

const editVideoSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(1000, "Description cannot exceed 1000 characters").optional(),
  thumbnail: z.any().optional(), // File object for new thumbnail
});

export default function EditVideoModal({
  open,
  onClose,
  video, // The video object to be edited
  onSubmit, // Function to call on form submission
  isLoading,
  error,
  success,
}) {
  const [thumbPreview, setThumbPreview] = useState(null);
  const [isPublic, setIsPublic] = useState(video?.isPublished ?? true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(editVideoSchema),
    defaultValues: {
      title: video?.title || "",
      description: video?.description || "",
    },
  });

  const newThumbnail = watch("thumbnail");

  useEffect(() => {
    if (open && video) {
      reset({
        title: video.title || "",
        description: video.description || "",
      });
      setIsPublic(video.isPublished ?? true);
      setThumbPreview(video.thumbnail?.url || null);
    } else if (!open) {
      reset();
      setThumbPreview(null);
    }
  }, [open, video, reset]);

  useEffect(() => {
    if (newThumbnail && newThumbnail[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setThumbPreview(e.target.result);
      reader.readAsDataURL(newThumbnail[0]);
    } else if (open && video && !newThumbnail) {
      setThumbPreview(video.thumbnail?.url || null);
    } else if (!open) {
      setThumbPreview(null);
    }
  }, [newThumbnail, open, video]);

  const handleFormSubmit = (data) => {
    onSubmit({
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail?.[0],
      isPublic: isPublic,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl rounded-lg shadow-lg overflow-hidden bg-card border border-border p-0">
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-background">
          <DialogTitle className="text-2xl font-bold text-card-foreground">Edit Video</DialogTitle>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-card-foreground">
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
              form="edit-video-form"
              className="ml-2"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <form
          id="edit-video-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-8 px-8 py-8"
        >
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              // REMOVED: dark:text-white
              // CHANGED: text-input-foreground to text-card-foreground or text-foreground
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Enter video title"
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              // REMOVED: dark:text-white
              // CHANGED: text-input-foreground to text-card-foreground or text-foreground
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              placeholder="Enter video description"
              rows={4}
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Thumbnail Selector Field */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">New Thumbnail (Optional)</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md bg-input cursor-pointer transition-colors hover:border-primary min-h-[180px] w-full p-4">
              {thumbPreview ? (
                <img src={thumbPreview} alt="Thumbnail preview" className="w-full h-32 object-cover rounded mb-2" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-sm text-muted-foreground">Drag & drop or click to select new thumbnail</span>
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
            <p className="mt-2 text-sm text-muted-foreground">Leave empty to keep current thumbnail.</p>
          </div>

          {/* Error/Success Messages */}
          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">{error}</div>}
          {success && <div className="p-3 bg-primary/10 border border-primary/20 rounded-md text-primary">{success}</div>}
        </form>
      </DialogContent>
    </Dialog>
  );
}