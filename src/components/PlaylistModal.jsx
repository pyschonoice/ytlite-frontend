// src/components/PlaylistModal.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "./ui/button";
import { Lock, Globe, Plus, X, CheckCircle2, Loader2 } from "lucide-react";
import CreateEditPlaylistModal from "./CreateEditPlaylistModal";
import { getUserPlaylists, createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist } from "../services/playlistApi"; // Ensure add/remove are imported

export default function PlaylistModal({ open, onClose, videoId, userId }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Fetch all playlists for the user
  const { data, isLoading } = useQuery({
    queryKey: ["userPlaylists", userId],
    // --- FIX START ---
    // Assuming getUserPlaylists returns { data: { playlists: [...] } } or { playlists: [...] }
    queryFn: async () => {
      const response = await getUserPlaylists(userId);
      // Depending on your ApiResponse structure, it might be response.data.playlists
      // or response.playlists directly if ApiResponse wraps it with just {playlists: ...}
      // Let's assume it's response.data.playlists as commonly seen with nested API structures.
      // If response.data is directly the array, use `response.data`
      if (response && response.data && Array.isArray(response.data.playlists)) {
        return response.data.playlists;
      }
      // If response.data is directly the array (no 'playlists' key)
      if (response && Array.isArray(response.data)) {
         return response.data;
      }
      // Fallback to empty array if data structure is unexpected, but avoid 'undefined'
      return [];
    },
    // --- FIX END ---
    enabled: open && !!userId,
  });
  // The 'data' returned by useQuery will now be the array of playlists, or an empty array
  const playlists = Array.isArray(data) ? data : [];


  // Add/remove video to/from playlist
  const toggleMutation = useMutation({
    mutationFn: async ({ playlistId, checked }) => {
      if (checked) {
        // Use the specific addVideoToPlaylist API function
        const res = await addVideoToPlaylist(videoId, playlistId);
        return res;
      } else {
        // Use the specific removeVideoFromPlaylist API function
        const res = await removeVideoFromPlaylist(videoId, playlistId);
        return res;
      }
    },
    onSuccess: (res, { checked }) => {
      queryClient.invalidateQueries(["userPlaylists", userId]); // Invalidate for this modal
      queryClient.invalidateQueries(["playlist", res.data?.data?._id || null]); // Invalidate specific playlist if ID is returned
      queryClient.invalidateQueries(["allUserPlaylists", userId]); // Invalidate for all user playlists page
      if (checked) { // Only show toast if video was added
        setToast("Video successfully added to playlist");
        setTimeout(() => setToast(""), 2000);
      }
    },
    onError: (err) => {
        console.error("Failed to toggle playlist status:", err);
        setToast(err?.response?.data?.message || "Failed to update playlist");
        setTimeout(() => setToast(""), 3000);
    }
  });

  const handleCreate = ({ name, description }) => {
    setCreateLoading(true);
    setCreateError("");
    createPlaylist({ name, description })
      .then(() => {
        setShowCreateModal(false);
        setCreateLoading(false);
        queryClient.invalidateQueries(["userPlaylists", userId]); // Refresh playlists list in modal
        queryClient.invalidateQueries(["allUserPlaylists", userId]); // Refresh all playlists page
      })
      .catch(err => {
        setCreateError(err?.response?.data?.message || "Failed to create playlist");
        setCreateLoading(false);
      });
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-card border border-border rounded-xl p-0 max-w-xs w-full shadow-xl flex flex-col">
          {/* Sticky header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
            <div className="font-semibold text-lg">Save video to...</div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[60vh] flex flex-col gap-1 px-2 py-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading playlists...</div>
            ) : (
              playlists.map((pl) => {
                // Ensure pl.videos is an array of video IDs if your backend returns it that way
                const checked = Array.isArray(pl.videos) && pl.videos.some(video => video._id === videoId || video === videoId); // Check by ID or direct ID
                return (
                  <label key={pl._id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={toggleMutation.isLoading}
                      onChange={e => toggleMutation.mutate({ playlistId: pl._id, checked: e.target.checked })}
                      className="accent-primary w-5 h-5"
                    />
                    {toggleMutation.isLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate">{pl.name}</span>
                    {pl.isPrivate ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Globe className="w-4 h-4 text-muted-foreground" />}
                  </label>
                );
              })
            )}
          </div>
          {/* New playlist button */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-border">
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setShowCreateModal(true)}
              variant="outline"
            >
              <Plus className="w-5 h-5" /> New playlist
            </Button>
          </div>
        </div>
        {/* Toast notification */}
        {toast && (
          <div className="fixed right-6 bottom-8 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toast}</span>
          </div>
        )}
      </div>
      <CreateEditPlaylistModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setCreateError(""); }}
        onSubmit={handleCreate}
        loading={createLoading}
        error={createError}
        mode="create"
      />
    </>
  );
}