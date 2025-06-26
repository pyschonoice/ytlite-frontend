import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import VideoListWithActions from "../components/VideoListWithActions";

export default function Liked() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    console.log(videos)

  

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