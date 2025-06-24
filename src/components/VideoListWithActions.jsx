import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export default function VideoListWithActions({
  title,
  videos = [],
  isLoading,
  isError,
  onRemove,
  onClear,
  clearLoading,
  confirmOpen,
  setConfirmOpen,
  onConfirmClear,
  removeError,
  emptyText = "No videos found.",
}) {
  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4 pb-4">
      {/* Sticky header */}
      {title && (<div className="flex items-center justify-between gap-4 bg-background z-40 sticky top-0 py-4 border-b border-border">
        <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
        {onClear && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            disabled={clearLoading || videos.length === 0}
          >
            Clear All
          </Button>
        )}
      </div>)}
      {confirmOpen && onClear && setConfirmOpen && onConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full shadow-xl flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-card-foreground">Clear all?</div>
            <div className="text-muted-foreground mb-6 text-center">This action cannot be undone.</div>
            <div className="flex gap-4 w-full justify-center">
              <Button
                variant="destructive"
                onClick={onConfirmClear}
                disabled={clearLoading}
              >
                {clearLoading ? "Clearing..." : "Yes, clear all"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={clearLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="flex flex-col gap-4 mt-8">
          {Array.from({ length: 5 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      )}
      {isError && (
        <div className="text-destructive mt-8">Failed to load.{removeError ? ` (${removeError.message})` : ""}</div>
      )}
      {!isLoading && !isError && videos.length === 0 && (
        <div className="text-muted-foreground mt-8">{emptyText}</div>
      )}
      <div className="flex-1 overflow-y-auto mt-4">
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <div key={video._id} className="relative flex items-center bg-card border border-border rounded-lg p-3 pr-12 shadow hover:shadow-lg transition-all duration-200">
              <div className="w-40 h-24 flex-shrink-0 rounded-md overflow-hidden mr-4">
                <VideoCard video={video} minimal />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-card-foreground text-lg truncate">{video.title}</div>
                <div className="text-sm text-muted-foreground truncate">
                  {video.ownerDetails?.fullName || video.ownerDetails?.username ||  video.videoOwnerDetails?.username || "Channel"}
                </div>
                <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                  <span>{video.views?.toLocaleString()} views</span>
                  <span>•</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-card/80 hover:bg-destructive hover:text-white"
                  onClick={() => onRemove(video._id)}
                  aria-label="Remove"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 