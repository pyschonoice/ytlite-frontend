// src/pages/Playlists.jsx (This is your playlist *details* page)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getPlaylist, // Uses getPlaylist
  updatePlaylistDetails,
  deletePlaylist,
  removeVideoFromPlaylist,
} from "../services/playlistApi";
import { useState, useEffect } from "react";
import VideoListWithActions from "../components/VideoListWithActions";
import { Button } from "../components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import CreateEditPlaylistModal from "../components/CreateEditPlaylistModal";
import ProgressModal from "../components/ProgressModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

export default function Playlists() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playlistId } = useParams();

  const [confirmDeletePlaylist, setConfirmDeletePlaylist] = useState(false);
  const [playlistToDeleteTitle, setPlaylistToDeleteTitle] = useState("");

  const [confirmRemoveVideoId, setConfirmRemoveVideoId] = useState(null);
  const [videoToRemoveTitle, setVideoToRemoveTitle] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [playlistToEditData, setPlaylistToEditData] = useState(null);

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalTitle, setProgressModalTitle] = useState("");
  const [progressModalDescription, setProgressModalDescription] = useState("");
  const [progressModalVariant, setProgressModalVariant] = useState("loading");

  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch playlist details
  const { data: playlistResponse, isLoading, isError, error, refetch: refetchPlaylist } = useQuery({ // Renamed data to playlistResponse
    queryKey: ["playlist", playlistId],
    queryFn: async () => {
      const res = await getPlaylist(playlistId);
      return res.data; // Expecting { data: { playlist: {...} } } from ApiResponse
    },
    enabled: !!playlistId && !!user,
  });

  // Access the playlist object correctly from the response
  const playlist = playlistResponse?.playlist || {}; // Accessing .playlist key directly

  const videos = Array.isArray(playlist.videos)
    ? playlist.videos.map((v) => ({
        ...v,
        ownerDetails: v.videoOwnerDetails || v.ownerDetails || v.owner || {},
      }))
    : [];

  const isOwner = user && playlist.owner && user._id === playlist.owner?._id;

  const descLimit = 80;
  const isLongDesc = (playlist.description || "").length > descLimit;
  const descToShow = showFullDesc || !isLongDesc ? playlist.description : (playlist.description || "").slice(0, descLimit) + "...";

  // --- MUTATIONS ---

  const deletePlaylistMutation = useMutation({
    mutationFn: () => deletePlaylist(playlistId),
    onMutate: () => {
      setConfirmDeletePlaylist(false);
      setShowProgressModal(true);
      setProgressModalTitle("Deleting Playlist...");
      setProgressModalDescription("This playlist is being permanently removed.");
      setProgressModalVariant("loading");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["playlist", playlistId]);
      queryClient.invalidateQueries(["allUserPlaylists", user?._id]);
      queryClient.invalidateQueries(["userPlaylists", user?._id]);
      setShowProgressModal(true);
      setProgressModalTitle("Success!");
      setProgressModalDescription("Playlist deleted successfully!");
      setProgressModalVariant("success");
      setTimeout(() => {
        setShowProgressModal(false);
        navigate("/playlists/all");
      }, 2000);
    },
    onError: (err) => {
      setShowProgressModal(true);
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || "Failed to delete playlist.");
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error("Delete playlist failed:", err);
    },
  });

  const updatePlaylistDetailsMutation = useMutation({
    mutationFn: (updateData) => updatePlaylistDetails(playlistId, updateData),
    onMutate: () => {
      setEditMode(false);
      setShowProgressModal(true);
      setProgressModalTitle("Updating Playlist...");
      setProgressModalDescription("Saving playlist details.");
      setProgressModalVariant("loading");
    },
    onSuccess: (res) => {
      // Instead of refetching, update cache with new data
      queryClient.setQueryData(["playlist", playlistId], (oldData) => {
        return { ...oldData, data: { playlist: res.data.playlist } };
      });
      queryClient.invalidateQueries(["allUserPlaylists", user?._id]);
      queryClient.invalidateQueries(["userPlaylists", user?._id]);
      setShowProgressModal(true);
      setProgressModalTitle("Success!");
      setProgressModalDescription("Playlist updated successfully!");
      setProgressModalVariant("success");
      setTimeout(() => setShowProgressModal(false), 2000);
    },
    onError: (err) => {
      setShowProgressModal(true);
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || "Failed to update playlist.");
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error("Update playlist failed:", err);
    },
  });

  const removeVideoFromPlaylistMutation = useMutation({
    mutationFn: (videoIdToRemove) => removeVideoFromPlaylist(videoIdToRemove, playlistId),
    onMutate: () => {
      setConfirmRemoveVideoId(null);
      setShowProgressModal(true);
      setProgressModalTitle("Removing Video...");
      setProgressModalDescription("Removing video from playlist.");
      setProgressModalVariant("loading");
    },
    onSuccess: (res) => {
      // Update cache for current playlist to reflect video removal
      queryClient.setQueryData(["playlist", playlistId], (oldData) => {
        return { ...oldData, data: { playlist: res.data.playlist } };
      });
      setShowProgressModal(true);
      setProgressModalTitle("Success!");
      setProgressModalDescription("Video removed from playlist!");
      setProgressModalVariant("success");
      setTimeout(() => setShowProgressModal(false), 2000);
    },
    onError: (error) => {
      setShowProgressModal(true);
      setProgressModalTitle("Error!");
      setProgressModalDescription(error?.response?.data?.message || "Failed to remove video from playlist.");
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error("Remove video from playlist failed:", error);
    },
  });


  // --- HANDLERS ---

  const handleOpenEditModal = () => {
    setPlaylistToEditData({ name: playlist.name, description: playlist.description });
    setEditMode(true);
  };

  const handleEditSubmit = (data) => {
    updatePlaylistDetailsMutation.mutate(data);
  };

  const handleOpenDeletePlaylistConfirmation = () => {
    setPlaylistToDeleteTitle(playlist.name);
    setConfirmDeletePlaylist(true);
  };

  const handleRemoveVideoFromPlaylistClick = (videoId, videoTitle) => {
    setConfirmRemoveVideoId(videoId);
    setVideoToRemoveTitle(videoTitle);
  };

  const confirmVideoRemoval = () => {
    if (confirmRemoveVideoId && playlistId) {
      removeVideoFromPlaylistMutation.mutate(confirmRemoveVideoId);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-muted-foreground">
        Loading playlist...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-destructive text-xl mt-20">
        Error loading playlist: {error?.message || "Playlist not found or access denied."}
      </div>
    );
  }

  // Check if playlist._id exists after loading
  if (!playlist._id) {
    return (
      <div className="text-center text-muted-foreground text-xl mt-20">
        Playlist not found.
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        {/* Custom sticky header */}
        <div className="flex items-center justify-between gap-4 bg-background z-40 sticky top-0 py-4 border-b border-border">
          <div className="flex flex-col min-w-0">
            <div className="text-2xl font-bold text-card-foreground break-words">{playlist.name}</div>
            <div className="text-muted-foreground text-base break-words max-w-2xl overflow-y-auto overflow-x-hidden">
              {descToShow}
              {isLongDesc && (
                <button
                  className="ml-2 text-primary underline text-xs"
                  onClick={() => setShowFullDesc((v) => !v)}
                >
                  {showFullDesc ? "View less" : "View more"}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOwner && (
              <>
                <Button size="icon" variant="ghost" onClick={handleOpenEditModal}>
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="destructive" onClick={handleOpenDeletePlaylistConfirmation}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Video List With Actions */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden mt-4">
          <VideoListWithActions
            title={null}
            videos={videos}
            isLoading={isLoading}
            isError={isError}
            emptyText="No videos in this playlist."
            {...(isOwner ? { onRemove: (videoId) => handleRemoveVideoFromPlaylistClick(videoId, videos.find((v) => v._id === videoId)?.title) } : {})}
          />
        </div>

        <CreateEditPlaylistModal
          open={editMode}
          onClose={() => { setEditMode(false); }}
          onSubmit={handleEditSubmit}
          loading={updatePlaylistDetailsMutation.isLoading}
          error={updatePlaylistDetailsMutation.isError ? (updatePlaylistDetailsMutation.error?.response?.data?.message || "Failed to update playlist") : ""}
          mode="edit"
          initialName={playlistToEditData?.name || playlist.name}
          initialDescription={playlistToEditData?.description || playlist.description}
        />
      </div>

      {/* Confirm Delete Playlist Modal */}
      <ConfirmDeleteModal
        open={confirmDeletePlaylist}
        onClose={() => setConfirmDeletePlaylist(false)}
        onConfirm={() => deletePlaylistMutation.mutate()}
        isLoading={deletePlaylistMutation.isLoading}
        videoTitle={playlistToDeleteTitle}
      />

      {/* Confirm Remove Video from Playlist Modal */}
      <ConfirmDeleteModal
        open={!!confirmRemoveVideoId}
        onClose={() => setConfirmRemoveVideoId(null)}
        onConfirm={confirmVideoRemoval}
        isLoading={removeVideoFromPlaylistMutation.isLoading}
        videoTitle={videoToRemoveTitle}
      />

      {/* Progress/Status Modal */}
      <ProgressModal
        open={showProgressModal}
        title={progressModalTitle}
        description={progressModalDescription}
        variant={progressModalVariant}
      />
    </div>
  );
}