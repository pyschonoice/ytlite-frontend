import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { formatNumber, formatTimeAgo } from "../lib/utils";
import VideoListWithActions from "../components/VideoListWithActions";

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
    <VideoListWithActions
      title="Watch History"
      videos={videos}
      isLoading={isLoading}
      isError={isError}
      onRemove={videoId => removeMutation.mutate(videoId)}
      onClear={() => setConfirmOpen(true)}
      clearLoading={clearMutation.isLoading}
      confirmOpen={confirmOpen}
      setConfirmOpen={setConfirmOpen}
      onConfirmClear={() => clearMutation.mutate()}
      removeError={removeMutation.error}
      emptyText="No watch history yet."
    />
  );
}