import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, api } from "../services/api";
import { useState } from "react";
import { Button } from "./ui/button";
import { Lock, Globe, Plus, X, CheckCircle2, Loader2 } from "lucide-react";
import CreateEditPlaylistModal from "./CreateEditPlaylistModal";
import { getUserPlaylists, createPlaylist } from "../services/playlistApi";

export default function PlaylistModal({ open, onClose, videoId, userId }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Fetch all playlists for the user
  const { data, isLoading } = useQuery({
    queryKey: ["userPlaylists", userId],
    queryFn: () => getUserPlaylists(userId).then(res => res.data.data),
    enabled: open && !!userId,
  });
  const playlists = Array.isArray(data?.playlists) ? data.playlists : [];

  // Fetch playlist details for this video (which playlists contain this video)
  // We'll fetch all playlists and check if videoId is in each playlist's videos array
  // (Assumes playlist.videos is an array of video IDs)

  // Add/remove video to/from playlist
  const toggleMutation = useMutation({
    mutationFn: async ({ playlistId, checked }) => {
      if (checked) {
        const res = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
        return res;
      } else {
        const res = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
        return res;
      }
    },
    onSuccess: (res, { checked }) => {
      queryClient.invalidateQueries(["userPlaylists", userId]);
      if (checked && res?.status === 200) {
        setToast("Video successfully added to playlist");
        setTimeout(() => setToast(""), 2000);
      }
    },
  });

  const handleCreate = ({ name, description }) => {
    setCreateLoading(true);
    setCreateError("");
    createPlaylist({ name, description })
      .then(() => {
        setShowCreateModal(false);
        setCreateLoading(false);
        queryClient.invalidateQueries(["userPlaylists", userId]);
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
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : (
              playlists.map((pl) => {
                const checked = Array.isArray(pl.videos) && pl.videos.includes(videoId);
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