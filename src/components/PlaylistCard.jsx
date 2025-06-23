export default function PlaylistCard({ playlist }) {
  return (
    <div className="group block rounded-lg overflow-hidden bg-card border border-border shadow hover:shadow-lg transition-all duration-200 p-4">
      <div className="font-semibold text-card-foreground line-clamp-2 text-base mb-1">
        {playlist.name}
      </div>
      <div className="text-xs text-muted-foreground mb-2">{playlist.description}</div>
      <div className="text-xs text-muted-foreground">{playlist.videoCount} videos</div>
    </div>
  );
} 