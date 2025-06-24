import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import VideoListWithActions from "../components/VideoListWithActions";
import { Button } from "../components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import CreateEditPlaylistModal from "../components/CreateEditPlaylistModal";
import {
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  clearPlaylistVideos,
  removeVideoFromPlaylist,
} from "../services/playlistApi";

export default function Playlists() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playlistId } = useParams();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  // Fetch playlist details
  const { data, isLoading, isError } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => getPlaylist(playlistId).then(res => res.data),
    enabled: !!playlistId,
  });
  const playlist = data?.data || {};
  const videos = playlist.videos || [];

  const descLimit = 80;
  const isLongDesc = (playlist.description || "").length > descLimit;
  const descToShow = showFullDesc || !isLongDesc ? playlist.description : (playlist.description || "").slice(0, descLimit) + "...";

  // Mutations for delete and clear
  const deleteMutation = useMutation({
    mutationFn: () => deletePlaylist(playlistId),
    onSuccess: () => {
      queryClient.invalidateQueries(["playlist", playlistId]);
      navigate("/profile");
    },
  });
  // Add/remove video to/from playlist , fix this
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
  const clearMutation = useMutation({
    mutationFn: () => clearPlaylistVideos(playlistId),
    onSuccess: () => {
      queryClient.invalidateQueries(["playlist", playlistId]);
      setConfirmClear(false);
    },
  });
  const removeMutation = useMutation({
    mutationFn: (videoId) => removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries(["playlist", playlistId]);
    },
  });
  const handleEdit = ({ name, description }) => {
    setEditLoading(true);
    setEditError("");
    updatePlaylist(playlistId, { name, description })
      .then(() => {
        setEditMode(false);
        setEditLoading(false);
        queryClient.invalidateQueries(["playlist", playlistId]);
      })
      .catch(err => {
        setEditError(err?.response?.data?.message || "Failed to update playlist");
        setEditLoading(false);
      });
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4 pb-4">
      {isLoading && <div>Loading playlist...</div>}
      {isError && <div className="text-destructive">Failed to load playlist.</div>}
      {playlist && (
        <>
          {/* Custom sticky header as in the image */}
          <div className="flex items-center justify-between gap-4 bg-background z-40 sticky top-0 py-4 border-b border-border">
            <div className="flex flex-col min-w-0">
              <div className="text-2xl font-bold text-card-foreground break-words">{playlist.name}</div>
              <div className="text-muted-foreground text-base break-words max-w-2xl overflow-y-auto overflow-x-hidden">
                {descToShow}
                {isLongDesc && (
                  <button
                    className="ml-2 text-primary underline text-xs"
                    onClick={() => setShowFullDesc(v => !v)}
                  >
                    {showFullDesc ? "View less" : "View more"}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="icon" variant="ghost" onClick={() => setEditMode(true)}><Pencil className="w-5 h-5" /></Button>
              <Button size="icon" variant="destructive" onClick={() => setConfirmDelete(true)}><Trash2 className="w-5 h-5" /></Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmClear(true)}
                disabled={clearMutation.isLoading || videos.length === 0}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Confirm Clear All Modal */}
          {confirmClear && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full shadow-xl flex flex-col items-center">
                <div className="text-lg font-semibold mb-4 text-card-foreground">Clear all?</div>
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
                    onClick={() => setConfirmClear(false)}
                    disabled={clearMutation.isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Video List With Actions */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden mt-4">
            <VideoListWithActions
              title={null}
              videos={videos}
              isLoading={isLoading}
              isError={isError}
              clearLoading={clearMutation.isLoading}
              confirmOpen={confirmClear}
              setConfirmOpen={setConfirmClear}
              onRemove={videoId => removeMutation.mutate(videoId)}
              emptyText="No videos in this playlist."
            />
          </div>

          <CreateEditPlaylistModal
            open={editMode}
            onClose={() => { setEditMode(false); setEditError(""); }}
            onSubmit={handleEdit}
            loading={editLoading}
            error={editError}
            mode="edit"
            initialName={playlist.name}
            initialDescription={playlist.description}
          />
        </>
      )}
      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full shadow-xl flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-card-foreground">Delete this playlist?</div>
            <div className="text-muted-foreground mb-6 text-center">This action cannot be undone.</div>
            <div className="flex gap-4 w-full justify-center">
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? "Deleting..." : "Yes, delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(false)}
                disabled={deleteMutation.isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 