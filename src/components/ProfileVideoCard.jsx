// src/components/ProfileVideoCard.jsx
import { Pencil, X } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom"; // Use useNavigate for explicit navigation
import Avatar from "./ui/Avatar";
import { formatNumber, formatTimeAgo, formatDuration } from "../lib/utils";

export default function ProfileVideoCard({ video, onEdit, onDelete, className = "" }) {
  if (!video) return null;

  const navigate = useNavigate();
  const channel = video.ownerDetails || video.owner; // Ensure channel details are available

  // Function to navigate to the video details page
  const handleVideoCardClick = (e) => {
    // Only navigate if the click target is not an interactive element (button or link)
    // This prevents clicks on action buttons or channel links from triggering video navigation
    if (!e.target.closest('button, a')) {
      navigate(`/video/${video._id}`);
    }
  };

  // Function to navigate to the channel page
  const handleChannelClick = (e) => {
    e.stopPropagation(); // Prevent this click from bubbling up to handleVideoCardClick
    if (channel?.username) {
      navigate(`/channel/${channel.username}`);
    }
  };

  // Function to handle Edit button click
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent this click from bubbling up to handleVideoCardClick
    onEdit(video);
  };

  // Function to handle Delete button click
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent this click from bubbling up to handleVideoCardClick
    onDelete(video);
  };


  return (
    <div
      className={`group block rounded-lg overflow-hidden bg-card border border-border shadow hover:shadow-lg transition-all duration-200 relative ${className}`}
    >
      {/* Action Buttons Overlay - positioned absolutely on top of the card */}
      <div className="absolute inset-0 flex items-start justify-end p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="flex gap-1 pointer-events-auto"> {/* Make buttons clickable here */}
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8
                       bg-secondary/70 text-secondary-foreground
                       hover:bg-primary hover:text-primary-foreground
                       transition-colors duration-200"
            onClick={handleEditClick} // Use the specific handler
            aria-label="Edit video"
            title="Edit video"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8
                       bg-secondary/70 text-secondary-foreground
                       hover:bg-destructive hover:text-destructive-foreground
                       transition-colors duration-200"
            onClick={handleDeleteClick} // Use the specific handler
            aria-label="Delete video"
            title="Delete video"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main clickable content area of the video card */}
      {/* Attach onClick to this div to handle navigation */}
      <div className="block h-full w-full cursor-pointer" onClick={handleVideoCardClick}>
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
            {/* Channel link as a button with specific handler */}
            {channel && ( // Ensure channel exists before trying to render
              <button
                type="button"
                className="flex items-center gap-2 group/channel hover:underline bg-transparent border-none p-0 m-0"
                onClick={handleChannelClick} // Explicit handler for channel navigation
                tabIndex={0}
              >
                <Avatar user={channel} size="sm" />
                <span className="text-xs text-muted-foreground font-medium">
                  {channel.fullName || channel.username}
                </span>
              </button>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex gap-2">
            <span>{formatNumber(video.views)} views</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}