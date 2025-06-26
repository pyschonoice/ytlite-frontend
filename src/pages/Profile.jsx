// src/pages/Profile.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, api } from "../services/api";
import { createPlaylist } from "../services/playlistApi";
import { useAuth } from "../contexts/AuthContext";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
import PlaylistCard from "../components/PlaylistCard";
import PlaylistCardSkeleton from "../components/PlaylistCardSkeleton";
import TweetCard from "../components/TweetCard";
import TweetCardSkeleton from "../components/TweetCardSkeleton";
import { useState } from "react";
import { Plus, Video, List, Pencil } from "lucide-react";
import Avatar from "../components/ui/Avatar";
import AvatarSkeleton from "../components/ui/AvatarSkeleton";
import { Link, useNavigate } from "react-router-dom";
import ProfileBanner from "../components/ProfileBanner";
import SortAndActionBar from "../components/SortAndActionBar";
import PlaylistModal from "../components/PlaylistModal";
import CreateEditPlaylistModal from "../components/CreateEditPlaylistModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import EditVideoModal from "../components/EditVideoModal";
import ProfileVideoCard from "../components/ProfileVideoCard";
import ProgressModal from "../components/ProgressModal"; // NEW IMPORT

const TABS = [
  { key: "videos", label: "Videos" },
  { key: "playlists", label: "Playlists" },
  { key: "posts", label: "Posts" },
  { key: "subscribed", label: "Subscribed Channels" },
  { key: "subscribers", label: "Subscribers" },
];

export default function Profile() {
  const { user } = useAuth();
  const username = user?.username;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("videos");
  const [videoSort, setVideoSort] = useState("desc");
  const [postSort, setPostSort] = useState("desc");
  const [playlistSort, setPlaylistSort] = useState("desc");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false); // For confirmation
  const [videoToDelete, setVideoToDelete] = useState(null);

  // States for the new ProgressModal
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalTitle, setProgressModalTitle] = useState("");
  const [progressModalDescription, setProgressModalDescription] = useState("");
  const [progressModalVariant, setProgressModalVariant] = useState("loading");

  const [showEditModal, setShowEditModal] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);


  const { data: userData } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => get(`/user/c/${username}`),
    enabled: !!username,
  });
  const userId = userData?.data?.channel?._id;

  const { data: subsData, isLoading: loadingSubscribers } = useQuery({
    queryKey: ["subscribers", username],
    queryFn: () => get(`/subscribe/c/${username}`),
    enabled: !!username,
  });
  const { data: videosData } = useQuery({
    queryKey: ["profileVideos", userId, videoSort],
    queryFn: () => get(`/video/?userId=${userId}&sortBy=createdAt&sortType=${videoSort}`),
    enabled: !!userId,
  });
  const { data: tweetsData } = useQuery({
    queryKey: ["tweets", username, postSort],
    queryFn: () => get(`/tweet/c/${username}?sortBy=createdAt&sortType=${postSort}`),
    enabled: !!username,
  });
  const { data: playlistsData } = useQuery({
    queryKey: ["playlists", userId, playlistSort],
    queryFn: () => get(`/playlist/user/${userId}?sortBy=createdAt&sortType=${playlistSort}`),

    enabled: !!userId,
  });
  const { data: subscribedData, isLoading: loadingSubscribed } = useQuery({
    queryKey: ["subscribedChannels", username],
    queryFn: () => get(`/subscribe/u/${username}`),
    enabled: !!username,
  });

  const channel = userData?.data?.channel;
  const videos = videosData?.data?.videos || (Array.isArray(videosData?.data) ? videosData.data : []) || [];
  const tweets = tweetsData?.data?.tweets || tweetsData?.data || [];
  const playlists = playlistsData?.data?.playlists || playlistsData?.data || [];

  const subscribers = subsData?.data?.subscribers || [];
  const subscribedChannels = subscribedData?.data?.channels || subscribedData?.data || [];

  const isOwnProfile = user && channel && user._id === channel._id;

  // --- DELETE VIDEO LOGIC ---
  const deleteVideoMutation = useMutation({
    mutationFn: (videoId) => api.delete(`/video/${videoId}`),
    onMutate: async (deletedVideoId) => {
      // 1. Close the initial confirmation modal
      setShowDeleteModal(false);

      // 2. Open the ProgressModal for loading feedback
      setProgressModalTitle("Deleting Video...");
      setProgressModalDescription("Please wait while the video is being permanently removed.");
      setProgressModalVariant("loading");
      setShowProgressModal(true);

      // Optimistic update logic (as before)
      await queryClient.cancelQueries(["profileVideos", userId, videoSort]);
      const previousVideosData = queryClient.getQueryData(["profileVideos", userId, videoSort]);
      let currentVideosArray = [];
      if (previousVideosData) {
          if (Array.isArray(previousVideosData)) {
              currentVideosArray = previousVideosData;
          } else if (previousVideosData.videos) {
              currentVideosArray = previousVideosData.videos;
          } else if (previousVideosData.data && previousVideosData.data.videos) {
              // FIX: Corrected typo from previousoposData to previousVideosData
              currentVideosArray = previousVideosData.data.videos;
          } else if (previousVideosData.data && Array.isArray(previousVideosData.data)) {
              currentVideosArray = previousVideosData.data;
          }
      }
      const newVideosArray = currentVideosArray.filter(video => video._id !== deletedVideoId);
      if (previousVideosData && typeof previousVideosData === 'object' && !Array.isArray(previousVideosData)) {
          if (previousVideosData.videos) {
              queryClient.setQueryData(["profileVideos", userId, videoSort], { ...previousVideosData, videos: newVideosArray });
          } else if (previousVideosData.data && previousVideosData.data.videos) {
              queryClient.setQueryData(["profileVideos", userId, videoSort], { ...previousVideosData, data: { ...previousVideosData.data, videos: newVideosArray } });
          } else if (previousVideosData.data && Array.isArray(previousVideosData.data)) {
              queryClient.setQueryData(["profileVideos", userId, videoSort], { ...previousVideosData, data: newVideosArray });
          } else {
              queryClient.setQueryData(["profileVideos", userId, videoSort], newVideosArray);
          }
      } else {
          queryClient.setQueryData(["profileVideos", userId, videoSort], newVideosArray);
      }
      return { previousVideosData };
    },
    onSuccess: () => {
      // 3. Change ProgressModal to success state
      setProgressModalTitle("Success!");
      setProgressModalDescription("Video deleted successfully!");
      setProgressModalVariant("success");

      queryClient.invalidateQueries(["profileVideos", userId]); // Refetch list
      // Auto-close success message after a delay
      setTimeout(() => {
        setShowProgressModal(false); // Close progress modal
        setVideoToDelete(null); // Clear selected video
      }, 2000); // Display success for 2 seconds
      console.log("Video deleted successfully!");
    },
    onError: (err, deletedVideoId, context) => {
      // Rollback optimistic update
      if (context?.previousVideosData) {
        queryClient.setQueryData(["profileVideos", userId, videoSort], context.previousVideosData);
      }
      // 3. Change ProgressModal to error state
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || "Failed to delete video.");
      setProgressModalVariant("error");

      console.error("Delete video failed:", err);
      // Auto-close error message after a delay
      setTimeout(() => {
        setShowProgressModal(false); // Close progress modal
        setVideoToDelete(null); // Clear selected video
      }, 3000); // Display error for 3 seconds
    },
    onSettled: () => {
      // Nothing specific needed here, as success/error handle final closing
    }
  });

  const onVideoDeleteClick = (video) => {
    setVideoToDelete(video);
    setShowDeleteModal(true); // Open the confirmation modal
  };

  const confirmDelete = () => {
    // This is called when 'Delete' is clicked on ConfirmDeleteModal.
    // It initiates the mutation, and onMutate will then handle closing ConfirmDeleteModal
    // and opening ProgressModal.
    if (videoToDelete) {
      deleteVideoMutation.mutate(videoToDelete._id);
    }
  };

  // onEditSubmit and related states remain unchanged
  const onVideoEditClick = (video) => {
    setVideoToEdit(video);
    setShowEditModal(true);
    setEditError(null);
    setEditSuccess(null);
  };

  const onEditSubmit = async ({ title, description, thumbnail, isPublic }) => {
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("isPublic", isPublic);
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await api.patch(`/video/${videoToEdit._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditSuccess("Video updated successfully!");
      queryClient.invalidateQueries(["profileVideos", userId]);
      queryClient.invalidateQueries(["video", videoToEdit._id]);
      setTimeout(() => {
        setShowEditModal(false);
        setVideoToEdit(null);
      }, 1000);
    } catch (err) {
      setEditError(err?.response?.data?.message || "Failed to update video");
      console.error("Edit video failed:", err);
    } finally {
      setEditLoading(false);
    }
  };


  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <ProfileBanner
        channel={channel}
        userDataLoading={userData?.isLoading}
        subscribersCount={subscribers.length}
        videosCount={videos.length}
      />
      <div className="mb-6 border-b border-border flex gap-6 px-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 px-4 font-semibold text-base transition-colors border-b-2 ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-2 sm:px-6 flex flex-col gap-10">
        {tab === "videos" && (
          <>
            <SortAndActionBar
              sortOrder={videoSort}
              onSortChange={setVideoSort}
              actionLabel={"+ Upload"}
              actionIcon={<Video className="w-5 h-5" />}
              onAction={() => (window.location.href = "/upload")}
            />
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
              {videosData?.isLoading
                ? Array.from({ length: 5 }).map((_, i) => <VideoCardSkeleton key={i} />)
                : videos.map((video) => (
                  isOwnProfile ? (
                    <ProfileVideoCard
                      key={video._id}
                      video={video}
                      onEdit={onVideoEditClick}
                      onDelete={onVideoDeleteClick}
                    />
                  ) : (
                    <VideoCard key={video._id} video={video} />
                  )
                ))}
            </div>
          </>
        )}
        {tab === "posts" && (
          <>
            <SortAndActionBar
              sortOrder={postSort}
              onSortChange={setPostSort}
              actionLabel={"+ Post"}
              actionIcon={<Pencil className="w-5 h-5" />}
              onAction={() => alert("Create Post coming soon!")}
            />
            <div className="mb-8 px-2 max-w-2xl mx-auto flex flex-col gap-8">
              {tweetsData?.isLoading
                ? Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)
                : tweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} />)}
            </div>
          </>
        )}
        {tab === "playlists" && (
          <>
            <SortAndActionBar
              sortOrder={playlistSort}
              onSortChange={setPlaylistSort}
              actionLabel={"+ Create"}
              actionIcon={<List className="w-5 h-5" />}
              onAction={() => setShowCreateModal(true)}
            />
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {playlistsData?.isLoading
                ? Array.from({ length: 3 }).map((_, i) => <PlaylistCardSkeleton key={i} />)
                : playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist._id}
                    playlist={playlist}
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="cursor-pointer"
                  />
                ))}
            </div>
            <CreateEditPlaylistModal
              open={showCreateModal}
              onClose={() => { setShowCreateModal(false); setCreateError(""); }}
              onSubmit={({ name, description }) => {
                setCreateLoading(true);
                setCreateError("");
                createPlaylist({ name, description })
                  .then(() => {
                    setShowCreateModal(false);
                    setCreateLoading(false);
                    playlistsData.refetch && playlistsData.refetch();
                  })
                  .catch(err => {
                    setCreateError(err?.response?.data?.message || "Failed to create playlist");
                    setCreateLoading(false);
                  });
              }}
              loading={createLoading}
              error={createError}
              mode="create"
            />
          </>
        )}
        {tab === "subscribed" && (
          <div className="flex flex-col gap-4 mb-8">
            {loadingSubscribed
              ? Array.from({ length: 5 }).map((_, i) => <AvatarSkeleton key={i} size="lg" />)
              : (subscribedChannels.length === 0 ? <div className="text-muted-foreground">No subscriptions yet.</div> :
                subscribedChannels.map((ch) => (
                  <Link key={ch._id} to={`/channel/${ch.username}`} className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card hover:shadow transition">
                    <Avatar user={ch} size="lg" />
                    <div>
                      <div className="font-semibold text-card-foreground">{ch.fullName || ch.username}</div>
                      <div className="text-muted-foreground text-sm">@{ch.username}</div>
                    </div>
                  </Link>
                )))}
          </div>
        )}
        {tab === "subscribers" && (
          <div className="flex flex-col gap-4 mb-8">
            {loadingSubscribers
              ? Array.from({ length: 5 }).map((_, i) => <AvatarSkeleton key={i} size="lg" />)
              : (subscribers.length === 0 ? <div className="text-muted-foreground">No subscribers yet.</div> :
                subscribers.map((ch) => (
                  <Link key={ch._id} to={`/channel/${ch.username}`} className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card hover:shadow transition">
                    <Avatar user={ch} size="lg" />
                    <div>
                      <div className="font-semibold text-card-foreground">{ch.fullName || ch.username}</div>
                      <div className="text-muted-foreground text-sm">@{ch.username}</div>
                    </div>
                  </Link>
                )))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)} // User clicks Cancel or outside
        onConfirm={confirmDelete} // User clicks Delete, initiates mutation
        isLoading={deleteVideoMutation.isLoading} // To disable buttons if mutation has started
        videoTitle={videoToDelete?.title}
      />

      {/* Progress/Status Modal */}
      <ProgressModal
        open={showProgressModal}
        title={progressModalTitle}
        description={progressModalDescription}
        variant={progressModalVariant}
      />

      {/* Edit Video Modal */}
      {videoToEdit && (
        <EditVideoModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          video={videoToEdit}
          onSubmit={onEditSubmit}
          isLoading={editLoading}
          error={editError}
          success={editSuccess}
        />
      )}
    </div>
  );
}