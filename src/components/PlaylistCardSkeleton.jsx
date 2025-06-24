export default function PlaylistCardSkeleton() {
  return (
    <div className="block rounded-lg overflow-hidden bg-card border border-border shadow p-4 animate-pulse">
      <div className="h-4 w-2/3 bg-muted rounded mb-2" />
      <div className="h-3 w-1/2 bg-muted rounded mb-2" />
      <div className="h-3 w-1/3 bg-muted rounded mb-2" />
      <div className="flex items-center gap-2 mt-2">
        <div className="w-7 h-7 rounded-full bg-muted" />
        <div className="h-3 w-1/4 bg-muted rounded" />
      </div>
    </div>
  );
} 