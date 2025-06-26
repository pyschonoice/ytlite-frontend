// src/components/PlaylistListDisplay.jsx
import ProfilePlaylistCard from "./ProfilePlaylistCard";
import PlaylistCardSkeleton from "./PlaylistCardSkeleton";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

export default function PlaylistListDisplay({
  title,
  playlists = [],
  isLoading,
  isError,
  errorMessage,
  emptyText = "No playlists found.",
  onEditPlaylist,
  onDeletePlaylist,
  onCreatePlaylist,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      {title && (
        <div className="flex items-center justify-between gap-4 bg-background z-40 sticky top-0 py-4 border-b border-border">
          <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
          {onCreatePlaylist && (
            <Button
              variant="default"
              size="sm"
              onClick={onCreatePlaylist}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create New
            </Button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <PlaylistCardSkeleton key={i} />
          ))}
        </div>
      )}
      {isError && (
        <div className="text-destructive mt-8">Failed to load playlists.{errorMessage ? ` (${errorMessage})` : ""}</div>
      )}
      {!isLoading && !isError && playlists.length === 0 && (
        <div className="text-muted-foreground mt-8">{emptyText}</div>
      )}

      {!isLoading && !isError && playlists.length > 0 && (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-4">
          {playlists.map((playlist) => (
            <ProfilePlaylistCard
              key={playlist._id}
              playlist={playlist}
              onEdit={onEditPlaylist}
              onDelete={onDeletePlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
}