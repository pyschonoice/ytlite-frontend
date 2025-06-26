// src/pages/Profile.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, api } from "../services/api";
// Ensure getUserPlaylists is imported from playlistApi
import { createPlaylist, updatePlaylistDetails, deletePlaylist, getUserPlaylists } from "../services/playlistApi";
import { useAuth } from "../contexts/AuthContext";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
// import PlaylistCard from "../components/PlaylistCard"; // If this is for generic display, might not be needed
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
import CreateEditPlaylistModal from "../components/CreateEditPlaylistModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import EditVideoModal from "../components/EditVideoModal";
import ProfileVideoCard from "../components/ProfileVideoCard";
// import ProfilePlaylistCard from "../components/ProfilePlaylistCard"; // Only needed if directly rendering cards
import ProgressModal from "../components/ProgressModal";
import PlaylistListDisplay from "../components/PlaylistListDisplay"; // Correct component for playlists tab


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

  const [showCreateEditPlaylistModal, setShowCreateEditPlaylistModal] = useState(false);
  const [playlistModalMode, setPlaylistModalMode] = useState("create");
  const [playlistToEdit, setPlaylistToEdit] = useState(null);

  const [showDeleteVideoModal, setShowDeleteVideoModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  const [showDeletePlaylistModal, setShowDeletePlaylistModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalTitle, setProgressModalTitle] = useState("");
  const [progressModalDescription, setProgressModalDescription] = useState("");
  const [progressModalVariant, setProgressModalVariant] = useState("loading");

  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [editVideoLoading, setEditVideoLoading] = useState(false);
  const [editVideoError, setEditVideoError] = useState(null);
  const [editVideoSuccess, setEditVideoSuccess] = useState(null);

  const navigate = useNavigate();


  // Fetch channel data (for profile banner and general user info)
  const { data: userData } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => get(`/user/c/${username}`),
    enabled: !!username, // Only enable if username is available
  });
  const userId = userData?.data?.channel?._id; // Get userId from the fetched channel data

  const { data: subsData, isLoading: loadingSubscribers } = useQuery({
    queryKey: ["subscribers", username],
    queryFn: () => get(`/subscribe/c/${username}`),
    enabled: !!username,
  });
  const { data: videosData } = useQuery({
    queryKey: ["profileVideos", userId, videoSort],
    queryFn: () => get(`/video/?userId=${userId}&sortBy=createdAt&sortType=${videoSort}`),
    enabled: !!userId, // Enable only if userId is available
  });
  const { data: tweetsData } = useQuery({
    queryKey: ["tweets", username, postSort],
    queryFn: () => get(`/tweet/c/${username}?sortBy=createdAt&sortType=${postSort}`),
    enabled: !!username,
  });
  const {
    data: playlistsData,
    isLoading: playlistsLoading,
    isError: playlistsError,
    error: playlistsFetchError,
  } = useQuery({
    queryKey: ["userPlaylists", userId, playlistSort],
    // Make sure userId is definitely available here before calling getUserPlaylists
    queryFn: () => {
        if (userId) { // Defensive check inside queryFn
            return getUserPlaylists(userId);
        }
        throw new Error("User ID is not available for fetching playlists.");
    },
    enabled: !!userId, // Only enable if userId is available
  });
  const { data: subscribedData, isLoading: loadingSubscribed } = useQuery({
    queryKey: ["subscribedChannels", username],
    queryFn: () => get(`/subscribe/u/${username}`),
    enabled: !!username,
  });

  const channel = userData?.data?.channel;
  const videos = videosData?.data?.videos || (Array.isArray(videosData?.data) ? videosData.data : []) || [];
  const tweets = tweetsData?.data?.tweets || tweetsData?.data || [];
  // Normalize playlists for the UI
  // Assuming backend response is data.data.playlists or data.playlists directly
  // Check the backend's getUserPlaylists controller output carefully.
  const playlists = Array.isArray(playlistsData?.data?.playlists)
    ? playlistsData.data.playlists.map(pl => ({
        ...pl,
        ownerDetails: pl.ownerDetails || pl.owner || {},
        videoCount: pl.videos?.length || 0, // This relies on `videos` being an array of objects/IDs
      }))
    : (Array.isArray(playlistsData?.data) ? playlistsData.data.map(pl => ({
        ...pl,
        ownerDetails: pl.ownerDetails || pl.owner || {},
        videoCount: pl.videos?.length || 0,
      })) : []);


  const subscribers = subsData?.data?.subscribers || [];
  const subscribedChannels = subscribedData?.data?.channels || subscribedData?.data || [];

  const isOwnProfile = user && channel && user._id === channel._id;

  // --- VIDEO DELETION LOGIC ---
  const deleteVideoMutation = useMutation({
    mutationFn: (videoId) => api.delete(`/video/${videoId}`),
    onMutate: async (deletedVideoId) => {
      setShowDeleteVideoModal(false);
      setProgressModalTitle("Deleting Video...");
      setProgressModalDescription("Please wait while the video is being permanently removed.");
      setProgressModalVariant("loading");
      setShowProgressModal(true);

      await queryClient.cancelQueries(["profileVideos", userId, videoSort]);
      const previousVideosData = queryClient.getQueryData(["profileVideos", userId, videoSort]);
      let currentVideosArray = [];
      if (previousVideosData) {
          if (Array.isArray(previousVideosData)) {
              currentVideosArray = previousVideosData;
          } else if (previousVideosData.videos) {
              currentVideosArray = previousVideosData.videos;
          } else if (previousVideosData.data && previousVideosData.data.videos) {
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
      setProgressModalTitle("Success!");
      setProgressModalDescription("Video deleted successfully!");
      setProgressModalVariant("success");
      queryClient.invalidateQueries(["profileVideos", userId]);
      setTimeout(() => {
        setShowProgressModal(false);
        setVideoToDelete(null);
      }, 2000);
      console.log("Video deleted successfully!");
    },
    onError: (err, deletedVideoId, context) => {
      if (context?.previousVideosData) {
        queryClient.setQueryData(["profileVideos", userId, videoSort], context.previousVideosData);
      }
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || "Failed to delete video.");
      setProgressModalVariant("error");
      console.error("Delete video failed:", err);
      setTimeout(() => {
        setShowProgressModal(false);
        setVideoToDelete(null);
      }, 3000);
    },
  });

  const onVideoDeleteClick = (video) => {
    setVideoToDelete(video);
    setShowDeleteVideoModal(true);
  };

  const confirmVideoDelete = () => {
    if (videoToDelete) {
      deleteVideoMutation.mutate(videoToDelete._id);
    }
  };

  // --- VIDEO EDIT LOGIC ---
  const onVideoEditClick = (video) => {
    setVideoToEdit(video);
    setShowEditVideoModal(true);
    setEditVideoError(null);
    setEditVideoSuccess(null);
  };

  const onEditVideoSubmit = async ({ title, description, thumbnail, isPublic }) => {
    setEditVideoLoading(true);
    setEditVideoError(null);
    setEditVideoSuccess(null);
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
      setEditVideoSuccess("Video updated successfully!");
      queryClient.invalidateQueries(["profileVideos", userId]);
      queryClient.invalidateQueries(["video", videoToEdit._id]);
      setTimeout(() => {
        setShowEditVideoModal(false);
        setVideoToEdit(null);
      }, 1000);
    } catch (err) {
      setEditVideoError(err?.response?.data?.message || "Failed to update video");
      console.error("Edit video failed:", err);
    } finally {
      setEditVideoLoading(false);
    }
  };


  // --- PLAYLIST CREATE/EDIT LOGIC (for profile page's "Create Playlist" button) ---
  const createEditPlaylistMutation = useMutation({
    mutationFn: async (data) => {
      if (playlistModalMode === "create") {
        return createPlaylist(data);
      } else if (playlistModalMode === "edit" && playlistToEdit) {
        return updatePlaylistDetails(playlistToEdit._id, data);
      }
      throw new Error("Invalid mode for playlist operation.");
    },
    onMutate: () => {
      setShowCreateEditPlaylistModal(false);
      setProgressModalTitle(playlistModalMode === "create" ? "Creating Playlist..." : "Saving Playlist...");
      setProgressModalDescription(
        playlistModalMode === "create"
          ? "Please wait while your new playlist is being created."
          : "Please wait while your playlist changes are being saved."
      );
      setProgressModalVariant("loading");
      setShowProgressModal(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userPlaylists", userId]);
      queryClient.invalidateQueries(["allUserPlaylists", user?._id]); // Invalidate for AllUserPlaylists page too
      setProgressModalTitle(playlistModalMode === "create" ? "Success!" : "Saved!");
      setProgressModalDescription(
        playlistModalMode === "create" ? "Playlist created successfully!" : "Playlist updated successfully!"
      );
      setProgressModalVariant("success");
      setPlaylistToEdit(null);
      setTimeout(() => setShowProgressModal(false), 2000);
    },
    onError: (err) => {
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || `Failed to ${playlistModalMode} playlist.`);
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error(`${playlistModalMode} playlist failed:`, err);
    },
  });

  const handleCreateEditPlaylistSubmit = (data) => {
    createEditPlaylistMutation.mutate(data);
  };

  const handleOpenCreatePlaylistModal = () => {
    setPlaylistModalMode("create");
    setPlaylistToEdit(null);
    setShowCreateEditPlaylistModal(true);
  };

  const handleOpenEditPlaylistModal = (playlist) => {
    setPlaylistModalMode("edit");
    setPlaylistToEdit(playlist);
    setShowCreateEditPlaylistModal(true);
  };


  // --- PLAYLIST DELETION LOGIC ---
  const deletePlaylistMutation = useMutation({
    mutationFn: (playlistId) => deletePlaylist(playlistId),
    onMutate: () => {
      setShowDeletePlaylistModal(false);
      setProgressModalTitle("Deleting Playlist...");
      setProgressModalDescription("Please wait while the playlist is being permanently removed.");
      setProgressModalVariant("loading");
      setShowProgressModal(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userPlaylists", userId]);
      queryClient.invalidateQueries(["allUserPlaylists", user?._id]); // Invalidate for AllUserPlaylists page too
      setProgressModalTitle("Success!");
      setProgressModalDescription("Playlist deleted successfully!");
      setProgressModalVariant("success");
      setPlaylistToDelete(null);
      setTimeout(() => setShowProgressModal(false), 2000);
    },
    onError: (err) => {
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || "Failed to delete playlist.");
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error("Delete playlist failed:", err);
    },
  });

  const handleOpenDeletePlaylistModal = (playlist) => {
    setPlaylistToDelete(playlist);
    setShowDeletePlaylistModal(true);
  };

  const confirmPlaylistDelete = () => {
    if (playlistToDelete) {
      deletePlaylistMutation.mutate(playlistToDelete._id);
    }
  };


  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-0"> {/* Added new wrapper for content centering */}
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
                onAction={handleOpenCreatePlaylistModal}
              />
              <PlaylistListDisplay
                playlists={playlists}
                isLoading={playlistsLoading}
                isError={playlistsError}
                errorMessage={playlistsFetchError?.message || ""}
                emptyText="No playlists yet."
                onEditPlaylist={handleOpenEditPlaylistModal}
                onDeletePlaylist={handleOpenDeletePlaylistModal}
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
      </div>

      {/* Confirmation Modal for Video Delete */}
      <ConfirmDeleteModal
        open={showDeleteVideoModal}
        onClose={() => setShowDeleteVideoModal(false)}
        onConfirm={confirmVideoDelete}
        isLoading={deleteVideoMutation.isLoading}
        videoTitle={videoToDelete?.title}
      />

      {/* Confirmation Modal for Playlist Delete */}
      <ConfirmDeleteModal
        open={showDeletePlaylistModal}
        onClose={() => setShowDeletePlaylistModal(false)}
        onConfirm={confirmPlaylistDelete}
        isLoading={deletePlaylistMutation.isLoading}
        videoTitle={playlistToDelete?.name || "this playlist"}
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
          open={showEditVideoModal}
          onClose={() => setShowEditVideoModal(false)}
          video={videoToEdit}
          onSubmit={onEditVideoSubmit}
          isLoading={editVideoLoading}
          error={editVideoError}
          success={editVideoSuccess}
        />
      )}

      {/* Create/Edit Playlist Modal for Profile Page */}
      <CreateEditPlaylistModal
        open={showCreateEditPlaylistModal}
        onClose={() => { setShowCreateEditPlaylistModal(false); setPlaylistToEdit(null); }}
        onSubmit={handleCreateEditPlaylistSubmit}
        loading={createEditPlaylistMutation.isLoading}
        error={createEditPlaylistMutation.isError ? (createEditPlaylistMutation.error?.response?.data?.message || "Operation failed") : ""}
        mode={playlistModalMode}
        initialName={playlistToEdit?.name || ""}
        initialDescription={playlistToEdit?.description || ""}
      />
    </div>
  );
}