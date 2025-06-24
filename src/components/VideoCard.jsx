import { Link } from "react-router-dom";

export default function VideoCard({ video, onClick, minimal }) {
  // Helper function to format duration to MM:SS
  const formatDuration = (seconds) => {
    // Ensure seconds is a number and handle potential non-numeric values
    const s = Math.floor(Number(seconds) || 0);
    const minutes = Math.floor(s / 60);
    const remainingSeconds = s % 60;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // Helper function for time elapsed (from your original code)
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  };

  if (minimal) {
    return (
      <Link
        to={`/video/${video._id}`}
        onClick={onClick}
        className="block w-full h-full"
      >
        <div className="aspect-video bg-muted overflow-hidden rounded-md">
          <img
            src={video.thumbnail?.url}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-200"
          />
          {video.duration && ( // Add duration to minimal view
            <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/video/${video._id}`}
      onClick={onClick}
      // Fixed size for the whole card (as per your provided code)
      className="group block w-[300px] h-[260px] rounded-xl overflow-hidden bg-card border border-border shadow hover:shadow-xl transition-all duration-200 flex flex-col"
    >
      {/* Thumbnail with fixed height relative to card */}
      <div className="relative w-full h-full bg-muted overflow-hidden rounded-t-xl">
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {/* Video duration overlay */}
        {video.duration !== undefined && ( // Check for undefined specifically
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      <div className="p-3 mb-0 flex flex-grow gap-2 w-full">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {video.ownerDetails?.avatar?.url && ( // Changed to ownerDetails
            <img
              src={video.ownerDetails.avatar.url} // Changed to ownerDetails
              alt={video.ownerDetails.fullName || video.ownerDetails.username} // Changed to ownerDetails
              className="w-9 h-9 rounded-full object-cover border border-border mt-1"
              loading="lazy"
            />
          )}
        </div>

        {/* Video details */}
        <div className="flex flex-col flex-grow min-w-0">
          <div className="font-bold text-card-foreground text-base break-words line-clamp-2 leading-tight">
            {video.title}
          </div>
          <div className="text-sm text-muted-foreground break-words line-clamp-1 mt-1">
            {video.ownerDetails?.fullName || video.ownerDetails?.username || "Channel"} {/* Changed to ownerDetails */}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <span>{video.views} views</span>
            {video.createdAt && (
              <>
                <span className="text-sm">·</span>
                <span>{timeAgo(video.createdAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}