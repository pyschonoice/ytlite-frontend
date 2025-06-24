import Avatar from "./ui/Avatar";

export default function PlaylistCard({ playlist, className = "", onClick, children }) {
  if (!playlist) return null;
  return (
    <div className={`group block rounded-lg overflow-hidden bg-card border border-border shadow hover:shadow-lg transition-all duration-200 p-4 ${className}`} onClick={onClick}>
      <div className="font-semibold text-card-foreground line-clamp-2 text-base mb-1">
        {playlist.name || <span className="italic text-muted-foreground">Untitled Playlist</span>}
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        {typeof playlist.videoCount === "number" ? `${playlist.videoCount} videos` : "0 videos"}
      </div>
      {playlist.ownerDetails && (
        <div className="mt-2 flex items-center gap-2">
          <Avatar user={playlist.ownerDetails} size="sm" />
          <span className="text-xs text-muted-foreground">{playlist.ownerDetails.fullName || playlist.ownerDetails.username}</span>
        </div>
      )}
      {children}
    </div>
  );
} 