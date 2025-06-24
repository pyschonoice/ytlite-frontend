import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import VideoCard from "../components/VideoCard";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["history"],
    queryFn: () => get("/user/history"),
    enabled: !!user,
  });

  // Normalize videos to always have ownerDetails for channel name
  const videos = Array.isArray(data?.data)
    ? data.data.map((v) => ({
        ...v,
        ownerDetails: v.ownerDetails || v.owner || {},
      }))
    : [];

  // Mutation to remove a video from history
  const removeMutation = useMutation({
    mutationFn: (videoId) => api.delete(`/user/history/${videoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["history"]);
    },
  });

  // Mutation to clear all history
  const clearMutation = useMutation({
    mutationFn: () => api.delete("/user/history"),
    onSuccess: () => {
      queryClient.invalidateQueries(["history"]);
      setConfirmOpen(false);
    },
  });

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4 pb-4">
      {/* Sticky header */}
      <div className="flex items-center justify-between gap-4 bg-background z-40 sticky top-0 py-4 border-b border-border">
        <h1 className="text-2xl font-bold text-card-foreground">Watch History</h1>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={clearMutation.isLoading || videos.length === 0}
        >
          Clear All
        </Button>
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full shadow-xl flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-card-foreground">Clear all watch history?</div>
            <div className="text-muted-foreground mb-6 text-center">This action cannot be undone.</div>
            <div className="flex gap-4 w-full justify-center">
              <Button
                variant="destructive"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isLoading}
              >
                {clearMutation.isLoading ? "Clearing..." : "Yes, clear all"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={clearMutation.isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {isLoading && <div className="text-muted-foreground mt-8">Loading history...</div>}
      {isError && (
        <div className="text-destructive mt-8">Failed to load history.{removeMutation.error ? ` (${removeMutation.error.message})` : ""}</div>
      )}
      {!isLoading && !isError && videos.length === 0 && (
        <div className="text-muted-foreground mt-8">No watch history yet.</div>
      )}
      {/* Scrollable video list - Ensure this container actually controls the scroll */}
      {/* The `h-full` on the parent `div` and `flex-1` here are crucial */}
      <div className="flex-1 overflow-y-auto mt-4">
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <div key={video._id} className="relative flex items-center bg-card border border-border rounded-lg p-3 pr-12 shadow hover:shadow-lg transition-all duration-200">
              <div className="w-40 h-24 flex-shrink-0 rounded-md overflow-hidden mr-4">
                <VideoCard video={video} minimal />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-card-foreground text-lg truncate">{video.title}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {video.ownerDetails?.fullName || video.ownerDetails?.username || "Channel"}
                </div>
                <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                  <span>{video.views} views</span>
                  <span>•</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-card/80 hover:bg-destructive hover:text-white"
                onClick={() => removeMutation.mutate(video._id)}
                disabled={removeMutation.isLoading}
                aria-label="Remove from history"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}