// src/components/ProfilePlaylistCard.jsx
import { Pencil, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";
import { formatTimeAgo } from "../lib/utils";
// REMOVED: import { useQuery } from "@tanstack/react-query";
// REMOVED: import { get } from "../services/api";

export default function ProfilePlaylistCard({ playlist, onEdit, onDelete, className = "" }) {
  if (!playlist) return null;

  const navigate = useNavigate();
  const owner = playlist.ownerDetails || playlist.owner;

  // --- FIXED: Directly access populated video thumbnail and count ---
  // Assuming playlist.videos is already populated by getUserPlaylists on the backend.
  // If it's NOT populated, the backend needs fixing, or a different (less efficient) strategy is required.
  const firstVideoThumbnail = playlist.videos?.[0]?.thumbnail?.url;
  const placeholderText = "Add video to get thumbnail";

  return (
    <div
      className={`group block rounded-lg overflow-hidden bg-card border border-border shadow hover:shadow-lg transition-all duration-200 relative ${className}`}
    >
      {/* Action Buttons Overlay */}
      <div className="absolute inset-0 flex items-start justify-end p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="flex gap-1 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8
                       bg-secondary/70 text-secondary-foreground
                       hover:bg-primary hover:text-primary-foreground
                       transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(playlist);
            }}
            aria-label="Edit playlist"
            title="Edit playlist"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8
                       bg-secondary/70 text-secondary-foreground
                       hover:bg-destructive hover:text-destructive-foreground
                       transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(playlist);
            }}
            aria-label="Delete playlist"
            title="Delete playlist"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* The actual clickable content of the playlist card */}
      <Link
        to={`/playlist/${playlist._id}`}
        className="block h-full w-full"
      >
        <div className="aspect-video bg-muted overflow-hidden relative">
          {firstVideoThumbnail ? ( // Use the directly available thumbnail
            <img
              src={firstVideoThumbnail}
              alt={playlist.name || "Playlist thumbnail"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 text-xs text-center p-2">
              {placeholderText}
            </div>
          )}
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
            {playlist.videoCount} videos {/* playlist.videoCount should be accurate from backend */}
          </span>
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div className="font-semibold text-card-foreground line-clamp-2 text-base">
            {playlist.name}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {owner && (
              <button
                type="button"
                className="flex items-center gap-2 group/channel hover:underline bg-transparent border-none p-0 m-0 pointer-events-auto"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/channel/${owner.username}`);
                }}
                tabIndex={0}
              >
                <Avatar user={owner} size="sm" />
                <span className="text-xs text-muted-foreground font-medium">
                  {owner.fullName || owner.username}
                </span>
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex gap-2">
            <span>{formatTimeAgo(playlist.createdAt)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}