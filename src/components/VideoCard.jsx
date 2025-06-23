import { Link } from "react-router-dom";

export default function VideoCard({ video, onClick }) {
  return (
    <Link
      to={`/video/${video._id}`}
      onClick={onClick}
      className="group block rounded-lg overflow-hidden bg-card border border-border shadow hover:shadow-lg transition-all duration-200"
    >
      <div className="aspect-video bg-muted overflow-hidden">
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="font-semibold text-card-foreground line-clamp-2 text-base">
          {video.title}
        </div>
        <div className="text-sm text-muted-foreground line-clamp-1">
          {video.ownerDetails?.fullName || video.ownerDetails?.username || "Channel"}
        </div>
        <div className="text-xs text-muted-foreground flex gap-2">
          <span>{video.views} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
} 