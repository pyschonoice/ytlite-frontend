// src/components/ProfileVideoCard.jsx
import { Pencil, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";
import { formatNumber, formatTimeAgo, formatDuration } from "../lib/utils";

export default function ProfileVideoCard({ video, onEdit, onDelete, className = "" }) {
  if (!video) return null;

  const navigate = useNavigate();
  const channel = video.ownerDetails || video.owner;
  const channelLink = channel?.username ? `/channel/${channel.username}` : undefined;

  return (
    <div
      className={`group block rounded-lg overflow-hidden bg-card border border-border shadow hover:shadow-lg transition-all duration-200 relative ${className}`}
    >
      {/* Action Buttons Overlay */}
      {/* Increased padding and used background/foreground colors from theme for better visibility */}
      <div className="absolute inset-0 flex items-start justify-end p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-1 pointer-events-auto">
          {/* Edit Button */}
          <Button
            variant="ghost" // Use ghost for transparent background, allowing overlay opacity to show through
            size="icon"
            className="rounded-full w-8 h-8
                       bg-secondary/70 text-secondary-foreground // Default state: semi-transparent secondary background with secondary-foreground text
                       hover:bg-primary hover:text-primary-foreground // Hover state: primary background with primary-foreground text
                       transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(video);
            }}
            aria-label="Edit video"
            title="Edit video"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost" // Use ghost for transparent background
            size="icon"
            className="rounded-full w-8 h-8
                       bg-secondary/70 text-secondary-foreground // Default state
                       hover:bg-destructive hover:text-destructive-foreground // Hover state: destructive background with destructive-foreground text
                       transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(video);
            }}
            aria-label="Delete video"
            title="Delete video"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* The actual clickable content of the video card */}
      <Link
        to={`/video/${video._id}`}
        className="block h-full w-full"
      >
        <div className="aspect-video bg-muted overflow-hidden relative">
          <img
            src={video.thumbnail?.url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {video.duration && (
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
        <div className="p-3 flex flex-col gap-2">
          <div className="font-semibold text-card-foreground line-clamp-2 text-base">
            {video.title}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {channelLink ? (
              <button
                type="button"
                className="flex items-center gap-2 group/channel hover:underline bg-transparent border-none p-0 m-0 pointer-events-auto"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(channelLink);
                }}
                tabIndex={0}
              >
                <Avatar user={channel} size="sm" />
                <span className="text-xs text-muted-foreground font-medium">
                  {channel.fullName || channel.username}
                </span>
              </button>
            ) : (
              <>
                <Avatar user={channel} size="sm" />
                <span className="text-xs text-muted-foreground font-medium">
                  {channel?.fullName || channel?.username}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex gap-2">
            <span>{formatNumber(video.views)} views</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}