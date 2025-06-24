import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import VideoListWithActions from "../components/VideoListWithActions";

export default function Liked() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["likedVideos"],
    queryFn: () => get("/like/videos"),
    enabled: !!user,
  });

  // Normalize videos to always have ownerDetails for channel name
  // Correctly access data.data.likedVideos
  const videos = Array.isArray(data?.data?.likedVideos)
    ? data.data.likedVideos.map((v) => ({
        ...v,
        // Ensure ownerDetails or videoOwnerDetails is correctly mapped
        ownerDetails: v.videoOwnerDetails || v.ownerDetails || v.owner || {},
      }))
    : [];

  // Mutation to remove a video from liked
  const removeMutation = useMutation({
    // The endpoint for removing a liked video should be `/like/:videoId`
    // assuming it's a DELETE request to unlike a video.
    // If your backend uses `/user/liked/:videoId` for unliking, keep it.
    // Based on common REST patterns, `/like/:videoId` is more typical for actions on 'like' resource.
    mutationFn: (videoId) => api.delete(`/like/${videoId}`), // Assuming this is the correct unlike endpoint
    onSuccess: () => {
      queryClient.invalidateQueries(["likedVideos"]);
    },
  });

  // Mutation to clear all liked videos
  const clearMutation = useMutation({
    // Assuming this is the correct endpoint to clear all liked videos.
    mutationFn: () => api.delete("/like/videos"),
    onSuccess: () => {
      queryClient.invalidateQueries(["likedVideos"]);
      setConfirmOpen(false);
    },
  });

  return (
    <VideoListWithActions
      title="Liked Videos"
      videos={videos}
      isLoading={isLoading}
      isError={isError}
      emptyText="No liked videos yet."
    />
  );
}