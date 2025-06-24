import { Link, useNavigate } from "react-router-dom";
import Avatar from "./ui/Avatar";
import { formatNumber, formatTimeAgo, formatDuration } from "../lib/utils";

export default function VideoCard({ video, className = "", onClick, children }) {
  const navigate = useNavigate();
  if (!video) return null;
  const channel = video.ownerDetails || video.owner;
  const channelLink = channel?.username ? `/channel/${channel.username}` : undefined;
  return (
    <Link
      to={`/video/${video._id}`}
      className={`group block rounded-lg overflow-hidden bg-card border border-border shadow hover:shadow-lg transition-all duration-200 ${className}`}
      onClick={onClick}
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
              className="flex items-center gap-2 group/channel hover:underline bg-transparent border-none p-0 m-0"
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
        {children}
      </div>
    </Link>
  );
}

