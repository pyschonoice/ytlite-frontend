// src/pages/AllUserPlaylists.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserPlaylists, createPlaylist, updatePlaylistDetails, deletePlaylist } from "../services/playlistApi";

import PlaylistListDisplay from "../components/PlaylistListDisplay";
import CreateEditPlaylistModal from "../components/CreateEditPlaylistModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ProgressModal from "../components/ProgressModal";

export default function AllUserPlaylists() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [playlistToEdit, setPlaylistToEdit] = useState(null);

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  // States for ProgressModal feedback
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalTitle, setProgressModalTitle] = useState("");
  const [progressModalDescription, setProgressModalDescription] = useState("");
  const [progressModalVariant, setProgressModalVariant] = useState("loading");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);


  // Fetch all user's playlists
  const {
    data: playlistsData,
    isLoading: playlistsLoading,
    isError: playlistsError,
    error: playlistsFetchError,
  } = useQuery({
    queryKey: ["allUserPlaylists", user?._id],
    // Make sure user?._id is definitely available here before calling getUserPlaylists
    queryFn: () => {
      if (user?._id) { // Defensive check inside queryFn
        return getUserPlaylists(user._id);
      }
      throw new Error("User ID is not available for fetching playlists."); // This error should be caught by react-query
    },
    enabled: !!user?._id, // Only enable query if user ID is present
  });

  // Normalize playlists for the UI
  // Assuming backend response is data.data.playlists or data.playlists directly
  // Check the backend's getUserPlaylists controller output carefully.
  const playlists = Array.isArray(playlistsData?.data?.playlists) // If backend nests under data.playlists
    ? playlistsData.data.playlists.map(pl => ({
        ...pl,
        ownerDetails: pl.ownerDetails || pl.owner || user || {},
        videoCount: pl.videos?.length || 0, // This relies on `videos` being an array of objects/IDs
      }))
    : (Array.isArray(playlistsData?.data) ? playlistsData.data.map(pl => ({ // If backend directly returns array in data
        ...pl,
        ownerDetails: pl.ownerDetails || pl.owner || user || {},
        videoCount: pl.videos?.length || 0,
      })) : []);


  // --- CREATE/EDIT PLAYLIST LOGIC ---
  const createEditMutation = useMutation({
    mutationFn: async (data) => {
      if (modalMode === "create") {
        return createPlaylist(data);
      } else if (modalMode === "edit" && playlistToEdit) {
        return updatePlaylistDetails(playlistToEdit._id, data);
      }
      throw new Error("Invalid mode for playlist operation.");
    },
    onMutate: () => {
      setShowCreateEditModal(false);
      setShowProgressModal(true);
      setProgressModalTitle(modalMode === "create" ? "Creating Playlist..." : "Saving Playlist...");
      setProgressModalDescription(
        modalMode === "create"
          ? "Please wait while your new playlist is being created."
          : "Please wait while your playlist changes are being saved."
      );
      setProgressModalVariant("loading");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["allUserPlaylists", user?._id]);
      queryClient.invalidateQueries(["userPlaylists", user?._id]); // Also invalidate for Profile page
      setProgressModalTitle(modalMode === "create" ? "Success!" : "Saved!");
      setProgressModalDescription(
        modalMode === "create" ? "Playlist created successfully!" : "Playlist updated successfully!"
      );
      setProgressModalVariant("success");
      setPlaylistToEdit(null);
      setTimeout(() => setShowProgressModal(false), 2000);
    },
    onError: (err) => {
      setProgressModalTitle("Error!");
      setProgressModalDescription(err?.response?.data?.message || `Failed to ${modalMode} playlist.`);
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error(`${modalMode} playlist failed:`, err);
    },
  });

  const handleCreateEditSubmit = (data) => {
    createEditMutation.mutate(data);
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setPlaylistToEdit(null);
    setShowCreateEditModal(true);
  };

  const handleOpenEditModal = (playlist) => {
    setModalMode("edit");
    setPlaylistToEdit(playlist);
    setShowCreateEditModal(true);
  };

  // --- DELETE PLAYLIST LOGIC ---
  const deleteMutation = useMutation({
    mutationFn: (playlistId) => deletePlaylist(playlistId),
    onMutate: () => {
      setShowDeleteConfirmation(false);
      setShowProgressModal(true);
      setProgressModalTitle("Deleting Playlist...");
      setProgressModalDescription("Please wait while the playlist is being permanently removed.");
      setProgressModalVariant("loading");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["allUserPlaylists", user?._id]);
      queryClient.invalidateQueries(["userPlaylists", user?._id]); // Also invalidate for Profile page
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

  const handleOpenDeleteConfirmation = (playlist) => {
    setPlaylistToDelete(playlist);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (playlistToDelete) {
      deleteMutation.mutate(playlistToDelete._id);
    }
  };


  if (authLoading || !user) { // Check authLoading explicitly here to show a proper loading state
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-muted-foreground">
        Loading authentication...
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        <PlaylistListDisplay
          title="My Playlists"
          playlists={playlists}
          isLoading={playlistsLoading} // This will be true if enabled is false
          isError={playlistsError}
          errorMessage={playlistsFetchError?.message || ""}
          emptyText="You haven't created any playlists yet."
          onEditPlaylist={handleOpenEditModal}
          onDeletePlaylist={handleOpenDeleteConfirmation}
          onCreatePlaylist={handleOpenCreateModal}
        />
      </div>

      {/* Create/Edit Playlist Modal */}
      <CreateEditPlaylistModal
        open={showCreateEditModal}
        onClose={() => {
          setShowCreateEditModal(false);
          setPlaylistToEdit(null);
        }}
        onSubmit={handleCreateEditSubmit}
        loading={createEditMutation.isLoading}
        error={createEditMutation.isError ? (createEditMutation.error?.response?.data?.message || "Operation failed") : ""}
        mode={modalMode}
        initialName={playlistToEdit?.name || ""}
        initialDescription={playlistToEdit?.description || ""}
      />

      {/* Confirm Delete Playlist Modal */}
      <ConfirmDeleteModal
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isLoading}
        videoTitle={playlistToDelete?.name || "this playlist"}
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